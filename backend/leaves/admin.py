from django.contrib import admin
from .models import LeaveType, PublicHoliday, LeaveRequest, LeaveBalance, ApprovalChain, AuditLog


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'max_days', 'requires_document')
    search_fields = ('name',)


@admin.register(PublicHoliday)
class PublicHolidayAdmin(admin.ModelAdmin):
    list_display = ('name', 'date')
    ordering = ('date',)


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'from_date', 'to_date', 'days_requested', 'status')
    list_filter = ('status', 'leave_type')
    search_fields = ('employee__name', 'employee__personal_number')
    ordering = ('-created_at',)


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'year', 'total_entitlement', 'taken')
    list_filter = ('year', 'leave_type')
    search_fields = ('employee__name',)


@admin.register(ApprovalChain)
class ApprovalChainAdmin(admin.ModelAdmin):
    list_display = ('leave_request', 'actor', 'part', 'action', 'timestamp')
    list_filter = ('part', 'action')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('actor', 'action', 'target_table', 'target_id', 'timestamp')
    list_filter = ('target_table',)
    ordering = ('-timestamp',)