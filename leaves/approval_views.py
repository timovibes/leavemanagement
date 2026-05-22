from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from datetime import date

from .models import LeaveRequest, ApprovalChain, LeaveBalance, AuditLog
from .serializers import LeaveRequestSerializer
from .utils import get_working_days, get_next_working_day
from accounts.permissions import IsSupervisor, IsHROfficer, IsHeadHR
from notifications.utils import create_notification
from notifications.tasks import (
    notify_employee_status_change,
    notify_hr_of_supervisor_approval,
    notify_head_hr_for_final_approval
)


def log_audit(actor, action, leave_request, extra=None):
    details = {
        'leave_id': leave_request.id,
        'employee': leave_request.employee.name,
        'status': leave_request.status,
    }
    if extra:
        details.update(extra)
    AuditLog.objects.create(
        actor=actor,
        action=action,
        target_table='leave_requests',
        target_id=leave_request.id,
        details=details
    )


# ─────────────────────────────────────────────
# PART II — Supervisor Approve / Reject
# ─────────────────────────────────────────────
class SupervisorReviewView(APIView):
    permission_classes = [IsSupervisor]

    def post(self, request, pk):
        leave_request = get_object_or_404(LeaveRequest, pk=pk)

        if leave_request.status != 'SUPERVISOR_REVIEW':
            return Response(
                {'detail': 'This request is not pending supervisor review.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if leave_request.employee.department != request.user.department:
            return Response(
                {'detail': 'You are not the supervisor for this employee.'},
                status=status.HTTP_403_FORBIDDEN
            )

        action = request.data.get('action')
        recommended_days = request.data.get('recommended_days')
        remarks = request.data.get('remarks', '')

        if action not in ['APPROVE', 'REJECT']:
            return Response(
                {'detail': 'Action must be APPROVE or REJECT.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            if action == 'REJECT':
                rejection_reason = request.data.get('rejection_reason', '').strip()
                if not rejection_reason:
                    return Response(
                        {'detail': 'Rejection reason is required.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                leave_request.status = 'REJECTED'
                leave_request.rejection_reason = rejection_reason
                leave_request.save()

                ApprovalChain.objects.create(
                    leave_request=leave_request,
                    actor=request.user,
                    part='II',
                    action='REJECTED',
                    remarks=rejection_reason
                )

                create_notification(
                    user=leave_request.employee,
                    message=(
                        f'Your {leave_request.leave_type.name} request was '
                        f'rejected by your supervisor. Reason: {rejection_reason}'
                    )
                )
                notify_employee_status_change.delay(
                    leave_request.id, 'REJECTED',
                    f'Reason: {rejection_reason}'
                )

            else:  # APPROVE
                if not recommended_days:
                    recommended_days = leave_request.days_requested
                else:
                    try:
                        recommended_days = int(recommended_days)
                    except ValueError:
                        return Response(
                            {'detail': 'recommended_days must be a number.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                leave_request.supervisor_recommended_days = recommended_days
                leave_request.status = 'HR_REVIEW'
                leave_request.save()

                ApprovalChain.objects.create(
                    leave_request=leave_request,
                    actor=request.user,
                    part='II',
                    action='APPROVED',
                    remarks=remarks
                )

                # Notify HR officers directly (in-app)
                from accounts.models import Employee
                hr_officers = Employee.objects.filter(
                    role__in=['HR_OFFICER', 'HEAD_HR']
                )
                for hr in hr_officers:
                    create_notification(
                        user=hr,
                        message=(
                            f'{leave_request.employee.name} — '
                            f'{leave_request.leave_type.name} request '
                            f'approved by supervisor. Needs HR review.'
                        )
                    )

                create_notification(
                    user=leave_request.employee,
                    message=(
                        f'Your {leave_request.leave_type.name} request was '
                        f'approved by your supervisor and forwarded to HR.'
                    )
                )
                notify_employee_status_change.delay(leave_request.id, 'HR_REVIEW')
                notify_hr_of_supervisor_approval.delay(leave_request.id)

            log_audit(request.user, f'SUPERVISOR_{action}', leave_request, {'remarks': remarks})

        return Response(LeaveRequestSerializer(leave_request).data)


# ─────────────────────────────────────────────
# PART III — HR Auto-Calculate & Review
# ─────────────────────────────────────────────
class HRReviewView(APIView):
    permission_classes = [IsHROfficer]

    def post(self, request, pk):
        leave_request = get_object_or_404(LeaveRequest, pk=pk)

        if leave_request.status != 'HR_REVIEW':
            return Response(
                {'detail': 'This request is not pending HR review.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee = leave_request.employee
        leave_type = leave_request.leave_type
        current_year = leave_request.from_date.year

        balance, _ = LeaveBalance.objects.get_or_create(
            employee=employee,
            leave_type=leave_type,
            year=current_year,
            defaults={'total_entitlement': leave_type.max_days}
        )

        resume_date = get_next_working_day(leave_request.to_date)

        override_entitlement = request.data.get('leave_entitlement')
        override_accumulated = request.data.get('accumulated_with_permission')
        override_resume = request.data.get('resume_date')

        with transaction.atomic():
            leave_request.leave_entitlement = (
                int(override_entitlement) if override_entitlement
                else balance.total_entitlement
            )
            leave_request.accumulated_with_permission = (
                int(override_accumulated) if override_accumulated
                else balance.accumulated_with_permission
            )
            leave_request.leave_taken_this_year = balance.taken
            leave_request.total_days_due = (
                leave_request.leave_entitlement +
                leave_request.accumulated_with_permission
            )
            leave_request.balance_remaining = (
                leave_request.total_days_due - balance.taken
            )
            leave_request.resume_date = (
                date.fromisoformat(override_resume) if override_resume
                else resume_date
            )
            leave_request.status = 'HR_CHECK'
            leave_request.save()

            ApprovalChain.objects.create(
                leave_request=leave_request,
                actor=request.user,
                part='III',
                action='VERIFIED',
                remarks=request.data.get('remarks', '')
            )

            overrides = {}
            if override_entitlement:
                overrides['leave_entitlement_overridden'] = override_entitlement
            if override_accumulated:
                overrides['accumulated_overridden'] = override_accumulated
            if override_resume:
                overrides['resume_date_overridden'] = override_resume
            if overrides:
                log_audit(request.user, 'HR_OVERRIDE_PART_III', leave_request, overrides)

            log_audit(request.user, 'HR_REVIEW_DONE', leave_request)

            create_notification(
                user=leave_request.employee,
                message=(
                    f'Your {leave_request.leave_type.name} request '
                    f'is being processed by HR.'
                )
            )
            notify_employee_status_change.delay(leave_request.id, 'HR_CHECK')

        return Response(LeaveRequestSerializer(leave_request).data)


# ─────────────────────────────────────────────
# PART IV — HR Allowance Calculation
# ─────────────────────────────────────────────
class HRAllowanceView(APIView):
    permission_classes = [IsHROfficer]

    def post(self, request, pk):
        leave_request = get_object_or_404(LeaveRequest, pk=pk)

        if leave_request.status != 'HR_CHECK':
            return Response(
                {'detail': 'Part IV requires the request to be in HR_CHECK status.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee = leave_request.employee
        approved_days = (
            leave_request.supervisor_recommended_days or
            leave_request.days_requested
        )

        daily_rate = employee.salary_band / 30
        calculated_allowance = daily_rate * approved_days
        override_allowance = request.data.get('leave_allowance_ksh')

        with transaction.atomic():
            leave_request.leave_allowance_ksh = (
                float(override_allowance) if override_allowance
                else calculated_allowance
            )
            leave_request.save()

            ApprovalChain.objects.create(
                leave_request=leave_request,
                actor=request.user,
                part='IV',
                action='VERIFIED',
                remarks=request.data.get('remarks', f'Allowance: KSh {leave_request.leave_allowance_ksh}')
            )

            if override_allowance:
                log_audit(
                    request.user, 'HR_OVERRIDE_ALLOWANCE', leave_request,
                    {
                        'calculated': str(calculated_allowance),
                        'overridden_to': override_allowance
                    }
                )

        return Response(LeaveRequestSerializer(leave_request).data)


# ─────────────────────────────────────────────
# PART V — HR Officer Final Verify
# ─────────────────────────────────────────────
class HROfficerVerifyView(APIView):
    permission_classes = [IsHROfficer]

    def post(self, request, pk):
        leave_request = get_object_or_404(LeaveRequest, pk=pk)

        if leave_request.status != 'HR_CHECK':
            return Response(
                {'detail': 'This request is not in HR_CHECK status.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if leave_request.leave_allowance_ksh is None:
            return Response(
                {'detail': 'Please complete Part IV (allowance) before verifying.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            ApprovalChain.objects.create(
                leave_request=leave_request,
                actor=request.user,
                part='V',
                action='VERIFIED',
                remarks=request.data.get('remarks', 'All parts verified by HR Officer.')
            )

            log_audit(request.user, 'HR_OFFICER_VERIFIED', leave_request)

            from accounts.models import Employee
            head_hr_list = Employee.objects.filter(role='HEAD_HR')
            for head in head_hr_list:
                create_notification(
                    user=head,
                    message=(
                        f'{leave_request.employee.name} — '
                        f'{leave_request.leave_type.name} request verified. '
                        f'Awaiting your final approval.'
                    )
                )

            notify_head_hr_for_final_approval.delay(leave_request.id)

        return Response(LeaveRequestSerializer(leave_request).data)


# ─────────────────────────────────────────────
# PART VI — Head HR Final Approval
# ─────────────────────────────────────────────
class HeadHRFinalApprovalView(APIView):
    permission_classes = [IsHeadHR]

    def post(self, request, pk):
        leave_request = get_object_or_404(LeaveRequest, pk=pk)

        if leave_request.status != 'HR_CHECK':
            return Response(
                {'detail': 'This request is not ready for final approval.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        part_v = leave_request.approvals.filter(part='V').exists()
        if not part_v:
            return Response(
                {'detail': 'HR Officer must verify (Part V) before final approval.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        action = request.data.get('action')
        if action not in ['APPROVE', 'REJECT']:
            return Response(
                {'detail': 'Action must be APPROVE or REJECT.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            if action == 'REJECT':
                rejection_reason = request.data.get('rejection_reason', '').strip()
                if not rejection_reason:
                    return Response(
                        {'detail': 'Rejection reason is required.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                leave_request.status = 'REJECTED'
                leave_request.rejection_reason = rejection_reason
                leave_request.save()

                ApprovalChain.objects.create(
                    leave_request=leave_request,
                    actor=request.user,
                    part='VI',
                    action='REJECTED',
                    remarks=rejection_reason
                )

                create_notification(
                    user=leave_request.employee,
                    message=(
                        f'Your {leave_request.leave_type.name} request was '
                        f'rejected by the Head of HR. Reason: {rejection_reason}'
                    )
                )
                notify_employee_status_change.delay(
                    leave_request.id, 'REJECTED',
                    f'Reason: {rejection_reason}'
                )

            else:  # FINAL APPROVE
                leave_request.status = 'APPROVED'
                leave_request.save()

                balance = LeaveBalance.objects.filter(
                    employee=leave_request.employee,
                    leave_type=leave_request.leave_type,
                    year=leave_request.from_date.year
                ).first()

                if balance:
                    approved_days = (
                        leave_request.supervisor_recommended_days or
                        leave_request.days_requested
                    )
                    balance.taken += approved_days
                    balance.save()

                ApprovalChain.objects.create(
                    leave_request=leave_request,
                    actor=request.user,
                    part='VI',
                    action='APPROVED',
                    remarks=request.data.get('remarks', 'Final approval granted.')
                )

                create_notification(
                    user=leave_request.employee,
                    message=(
                        f'Your {leave_request.leave_type.name} request for '
                        f'{leave_request.days_requested} days has been fully approved. '
                        f'Resume date: {leave_request.resume_date}.'
                    )
                )
                notify_employee_status_change.delay(leave_request.id, 'APPROVED')

                try:
                    from .tasks import generate_leave_pdf_task
                    generate_leave_pdf_task.delay(leave_request.id)
                except Exception:
                    pass

            log_audit(request.user, f'HEAD_HR_{action}', leave_request)

        return Response(LeaveRequestSerializer(leave_request).data)


# ─────────────────────────────────────────────
# Pending Queues
# ─────────────────────────────────────────────
class PendingSupervisorView(APIView):
    permission_classes = [IsSupervisor]

    def get(self, request):
        requests = LeaveRequest.objects.filter(
            status='SUPERVISOR_REVIEW',
            employee__department=request.user.department
        ).select_related('employee', 'leave_type').order_by('from_date')
        return Response(LeaveRequestSerializer(requests, many=True).data)


class PendingHRView(APIView):
    permission_classes = [IsHROfficer]

    def get(self, request):
        requests = LeaveRequest.objects.filter(
            status__in=['HR_REVIEW', 'HR_CHECK']
        ).select_related('employee', 'leave_type').order_by('from_date')
        return Response(LeaveRequestSerializer(requests, many=True).data)


class PendingHeadHRView(APIView):
    permission_classes = [IsHeadHR]

    def get(self, request):
        requests = LeaveRequest.objects.filter(
            status='HR_CHECK',
            approvals__part='V'
        ).distinct().select_related(
            'employee', 'leave_type'
        ).order_by('from_date')
        return Response(LeaveRequestSerializer(requests, many=True).data)