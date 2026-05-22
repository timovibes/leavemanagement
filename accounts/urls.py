from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, LogoutView, RegisterEmployeeView,
    MeView, ChangePasswordView, ForgotPasswordView,
    ResetPasswordView, EmployeeListView, EmployeeDetailView
)

from .views import DepartmentListCreateView, DepartmentDetailView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterEmployeeView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('employees/', EmployeeListView.as_view(), name='employee_list'),
    path('employees/<int:pk>/', EmployeeDetailView.as_view(), name='employee_detail'),

    path('departments/', DepartmentListCreateView.as_view(), name='departments'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(), name='department_detail'),
]