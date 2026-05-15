from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import LeaveRequest, LeaveType, LeaveBalance, PublicHoliday, AuditLog
from .serializers import (
    LeaveRequestSerializer, ApplyLeaveSerializer,
    LeaveTypeSerializer, LeaveBalanceSerializer, PublicHolidaySerializer
)
from .utils import get_working_days
from accounts.permissions import IsHROfficer, IsSupervisor
from notifications.utils import create_notification

from django.http import FileResponse
from django.core.files.storage import default_storage
import os


class LeaveTypeListView(generics.ListAPIView):
    serializer_class = LeaveTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = LeaveType.objects.all()


class PublicHolidayListView(generics.ListAPIView):
    serializer_class = PublicHolidaySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PublicHoliday.objects.order_by('date')


class MyLeaveBalanceView(generics.ListAPIView):
    serializer_class = LeaveBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        year = self.request.query_params.get('year', timezone.now().year)
        return LeaveBalance.objects.filter(
            employee=self.request.user,
            year=year
        ).select_related('leave_type')


class ApplyLeaveView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        serializer = ApplyLeaveSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            leave_request = serializer.save()

            AuditLog.objects.create(
                actor=request.user,
                action='LEAVE_APPLIED',
                target_table='leave_requests',
                target_id=leave_request.id,
                details={
                    'leave_type': leave_request.leave_type.name,
                    'from_date': str(leave_request.from_date),
                    'to_date': str(leave_request.to_date),
                    'days': leave_request.days_requested
                }
            )

        return Response(
            LeaveRequestSerializer(leave_request).data,
            status=status.HTTP_201_CREATED
        )


class SubmitLeaveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        leave_request = get_object_or_404(
            LeaveRequest, pk=pk, employee=request.user
        )

        if leave_request.status != 'DRAFT':
            return Response(
                {'detail': 'Only draft applications can be submitted.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        supervisor = (
            leave_request.employee.department.head
            if leave_request.employee.department else None
        )

        with transaction.atomic():
            if supervisor:
                leave_request.status = 'SUPERVISOR_REVIEW'
            else:
                leave_request.status = 'SUBMITTED'
            leave_request.save()

            AuditLog.objects.create(
                actor=request.user,
                action='LEAVE_SUBMITTED',
                target_table='leave_requests',
                target_id=leave_request.id,
                details={'status': leave_request.status}
            )

        # Queue email tasks (non-blocking)
        from notifications.tasks import (
            notify_supervisor_of_submission,
            notify_employee_status_change
        )
        notify_supervisor_of_submission.delay(leave_request.id)
        notify_employee_status_change.delay(
            leave_request.id,
            leave_request.status
        )

        # In-app notifications
        from notifications.utils import create_notification
        if supervisor:
            create_notification(
                user=supervisor,
                message=(
                    f'{leave_request.employee.name} submitted a '
                    f'{leave_request.leave_type.name} request. Please review.'
                )
            )

        return Response(LeaveRequestSerializer(leave_request).data)


class MyLeaveRequestsView(generics.ListAPIView):
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = LeaveRequest.objects.filter(
            employee=self.request.user
        ).select_related('leave_type', 'acting_officer').prefetch_related('approvals')

        year = self.request.query_params.get('year')
        leave_type = self.request.query_params.get('leave_type')
        status_filter = self.request.query_params.get('status')

        if year:
            qs = qs.filter(from_date__year=year)
        if leave_type:
            qs = qs.filter(leave_type_id=leave_type)
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs.order_by('-created_at')


class LeaveRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['HR_OFFICER', 'HEAD_HR', 'ADMIN']:
            return LeaveRequest.objects.all()
        if user.role == 'SUPERVISOR':
            return LeaveRequest.objects.filter(
                employee__department=user.department
            )
        return LeaveRequest.objects.filter(employee=user)

    def destroy(self, request, *args, **kwargs):
        leave_request = self.get_object()
        if leave_request.status != 'DRAFT':
            return Response(
                {'detail': 'Only draft applications can be deleted.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class AllLeaveRequestsView(generics.ListAPIView):
    """HR and above can see all requests."""
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsHROfficer]

    def get_queryset(self):
        qs = LeaveRequest.objects.select_related(
            'employee', 'leave_type', 'acting_officer'
        ).prefetch_related('approvals').order_by('-created_at')

        status_filter = self.request.query_params.get('status')
        department = self.request.query_params.get('department')
        year = self.request.query_params.get('year')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if department:
            qs = qs.filter(employee__department_id=department)
        if year:
            qs = qs.filter(from_date__year=year)

        return qs


class TeamLeaveRequestsView(generics.ListAPIView):
    """Supervisor sees their department's requests."""
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsSupervisor]

    def get_queryset(self):
        return LeaveRequest.objects.filter(
            employee__department=self.request.user.department
        ).select_related('employee', 'leave_type').order_by('-created_at')


class WorkingDaysCalculatorView(APIView):
    """Helper endpoint — frontend calls this when user picks dates."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from_date_str = request.query_params.get('from_date')
        to_date_str = request.query_params.get('to_date')

        if not from_date_str or not to_date_str:
            return Response(
                {'detail': 'from_date and to_date are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from datetime import date
            from_date = date.fromisoformat(from_date_str)
            to_date = date.fromisoformat(to_date_str)
        except ValueError:
            return Response(
                {'detail': 'Invalid date format. Use YYYY-MM-DD.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        days = get_working_days(from_date, to_date)
        return Response({'working_days': days})
    
class DownloadLeavePDFView(APIView):
permission_classes = [permissions.IsAuthenticated]

def get(self, request, pk):
    leave_request = get_object_or_404(LeaveRequest, pk=pk)

    # Only the employee, HR, or Head HR can download
    user = request.user
    if (user != leave_request.employee and
            user.role not in ['HR_OFFICER', 'HEAD_HR', 'ADMIN']):
        return Response(
            {'detail': 'Permission denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if leave_request.status != 'APPROVED':
        return Response(
            {'detail': 'PDF is only available for approved requests.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Generate on the fly if not saved yet
    from .pdf_generator import generate_leave_pdf
    pdf_buffer = generate_leave_pdf(leave_request)

    filename = f'KFS_Leave_LV{leave_request.id:05d}.pdf'
    response = FileResponse(
        pdf_buffer,
        content_type='application/pdf'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response