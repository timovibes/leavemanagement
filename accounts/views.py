from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings


from .serializers import (
    LoginSerializer, RegisterEmployeeSerializer, EmployeeSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
)
from .permissions import IsAdmin, IsHROfficer
from .tokens import password_reset_token

from rest_framework import generics
from .models import Department
from .serializers import DepartmentSerializer
from .permissions import IsAdmin

Employee = get_user_model()


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': EmployeeSerializer(user).data
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)


class RegisterEmployeeView(generics.CreateAPIView):
    """Only HR Officers and Admins can create employees."""
    serializer_class = RegisterEmployeeSerializer
    permission_classes = [IsHROfficer]

    def perform_create(self, serializer):
        employee = serializer.save()
        send_mail(
            subject='Welcome to KFS Leave System',
            message=(
                f'Hello {employee.name},\n\n'
                f'Your account has been created.\n'
                f'Email: {employee.email}\n'
                f'Please log in and change your password.\n\n'
                f'KFS Leave Management System'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[employee.email],
            fail_silently=True,
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(EmployeeSerializer(request.user).data)

    def patch(self, request):
        serializer = EmployeeSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        for protected in ['role', 'grade', 'salary_band', 'personal_number']:
            serializer.validated_data.pop(protected, None)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password changed successfully.'})


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = Employee.objects.get(email=email)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = password_reset_token.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        send_mail(
            subject='KFS Leave System — Password Reset',
            message=(
                f'Hello {user.name},\n\n'
                f'Click the link below to reset your password:\n{reset_url}\n\n'
                f'This link expires in 1 hour.\n\n'
                f'If you did not request this, ignore this email.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'detail': 'Password reset email sent.'})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data['token'].split('/')[0]))
            user = Employee.objects.get(pk=uid)
        except (Employee.DoesNotExist, ValueError):
            return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        raw_token = serializer.validated_data['token'].split('/')[-1] if '/' in serializer.validated_data['token'] else serializer.validated_data['token']

        if not password_reset_token.check_token(user, raw_token):
            return Response({'detail': 'Reset link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'detail': 'Password reset successful.'})


class EmployeeListView(generics.ListAPIView):
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Employee.objects.select_related('department').all()
        user = self.request.user
        department = self.request.query_params.get('department')
        role = self.request.query_params.get('role')

        # Only restrict non-HR roles to their department
        if user.role not in ['HR_OFFICER', 'HEAD_HR', 'ADMIN']:
            qs = qs.filter(department=user.department)

        if department:
            qs = qs.filter(department_id=department)
        if role:
            qs = qs.filter(role=role)

        return qs


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """HR and above can manage individual employees."""
    serializer_class = EmployeeSerializer
    permission_classes = [IsHROfficer]
    queryset = Employee.objects.all()

class DepartmentListCreateView(generics.ListCreateAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdmin]
    queryset = Department.objects.all()

class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdmin]
    queryset = Department.objects.all()