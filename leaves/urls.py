from django.urls import path
from .views import (
    LeaveTypeListView, PublicHolidayListView,
    MyLeaveBalanceView, ApplyLeaveView, SubmitLeaveView,
    MyLeaveRequestsView, LeaveRequestDetailView,
    AllLeaveRequestsView, TeamLeaveRequestsView,
    WorkingDaysCalculatorView
)

urlpatterns = [
    path('types/', LeaveTypeListView.as_view(), name='leave_types'),
    path('holidays/', PublicHolidayListView.as_view(), name='public_holidays'),
    path('balances/', MyLeaveBalanceView.as_view(), name='my_balances'),
    path('apply/', ApplyLeaveView.as_view(), name='apply_leave'),
    path('<int:pk>/submit/', SubmitLeaveView.as_view(), name='submit_leave'),
    path('my/', MyLeaveRequestsView.as_view(), name='my_requests'),
    path('<int:pk>/', LeaveRequestDetailView.as_view(), name='leave_detail'),
    path('all/', AllLeaveRequestsView.as_view(), name='all_requests'),
    path('team/', TeamLeaveRequestsView.as_view(), name='team_requests'),
    path('calculate-days/', WorkingDaysCalculatorView.as_view(), name='calculate_days'),
]