from django.urls import path
from .views import (
    LeaveTypeListView, PublicHolidayListView,
    MyLeaveBalanceView, ApplyLeaveView, SubmitLeaveView,
    MyLeaveRequestsView, LeaveRequestDetailView,
    AllLeaveRequestsView, TeamLeaveRequestsView,
    WorkingDaysCalculatorView
)
from .approval_views import (
    SupervisorReviewView, HRReviewView, HRAllowanceView,
    HROfficerVerifyView, HeadHRFinalApprovalView,
    PendingSupervisorView, PendingHRView, PendingHeadHRView
)

urlpatterns = [
    # Leave types & holidays
    path('types/', LeaveTypeListView.as_view(), name='leave_types'),
    path('holidays/', PublicHolidayListView.as_view(), name='public_holidays'),

    # Employee
    path('balances/', MyLeaveBalanceView.as_view(), name='my_balances'),
    path('apply/', ApplyLeaveView.as_view(), name='apply_leave'),
    path('my/', MyLeaveRequestsView.as_view(), name='my_requests'),
    path('calculate-days/', WorkingDaysCalculatorView.as_view(), name='calculate_days'),

    # HR & Supervisor list views
    path('all/', AllLeaveRequestsView.as_view(), name='all_requests'),
    path('team/', TeamLeaveRequestsView.as_view(), name='team_requests'),

    # Pending queues
    path('pending/supervisor/', PendingSupervisorView.as_view(), name='pending_supervisor'),
    path('pending/hr/', PendingHRView.as_view(), name='pending_hr'),
    path('pending/head-hr/', PendingHeadHRView.as_view(), name='pending_head_hr'),

    # Individual request
    path('<int:pk>/', LeaveRequestDetailView.as_view(), name='leave_detail'),
    path('<int:pk>/submit/', SubmitLeaveView.as_view(), name='submit_leave'),

    # Approval workflow
    path('<int:pk>/supervisor-review/', SupervisorReviewView.as_view(), name='supervisor_review'),
    path('<int:pk>/hr-review/', HRReviewView.as_view(), name='hr_review'),
    path('<int:pk>/hr-allowance/', HRAllowanceView.as_view(), name='hr_allowance'),
    path('<int:pk>/hr-verify/', HROfficerVerifyView.as_view(), name='hr_verify'),
    path('<int:pk>/final-approval/', HeadHRFinalApprovalView.as_view(), name='final_approval'),
]