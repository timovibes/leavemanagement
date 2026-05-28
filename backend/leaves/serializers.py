from rest_framework import serializers
from django.utils import timezone
from datetime import date, timedelta

from .models import LeaveRequest, LeaveType, LeaveBalance, PublicHoliday, ApprovalChain, AuditLog
from .utils import get_working_days, get_next_working_day
from accounts.models import Employee
from accounts.serializers import EmployeeSerializer


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'name', 'max_days', 'requires_document', 'description']


class PublicHolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicHoliday
        fields = ['id', 'name', 'date', 'description']


class LeaveBalanceSerializer(serializers.ModelSerializer):
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    remaining = serializers.ReadOnlyField()

    class Meta:
        model = LeaveBalance
        fields = [
            'id', 'leave_type', 'leave_type_name', 'year',
            'total_entitlement', 'accumulated_with_permission',
            'taken', 'remaining'
        ]


class ApprovalChainSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.name', read_only=True)

    class Meta:
        model = ApprovalChain
        fields = ['id', 'part', 'action', 'actor_name', 'remarks', 'timestamp']


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_department = serializers.CharField(source='employee.department.name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    acting_officer_name = serializers.CharField(source='acting_officer.name', read_only=True)
    approvals = ApprovalChainSerializer(many=True, read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name', 'employee_department',
            'leave_type', 'leave_type_name',
            'from_date', 'to_date', 'days_requested',
            'leave_address', 'phone_during_leave',
            'acting_officer', 'acting_officer_name',
            'status', 'attachment',
            'supervisor_recommended_days', 'rejection_reason',
            'leave_entitlement', 'accumulated_with_permission',
            'leave_taken_this_year', 'total_days_due',
            'balance_remaining', 'resume_date',
            'leave_allowance_ksh',
            'approvals', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'employee', 'days_requested', 'status',
            'supervisor_recommended_days', 'rejection_reason',
            'leave_entitlement', 'leave_taken_this_year',
            'total_days_due', 'balance_remaining', 'resume_date',
            'leave_allowance_ksh', 'approvals',
            'created_at', 'updated_at'
        ]


class ApplyLeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = [
            'leave_type', 'from_date', 'to_date',
            'leave_address', 'phone_during_leave',
            'acting_officer', 'attachment'
        ]

    def validate(self, data):
        user = self.context['request'].user
        leave_type = data['leave_type']
        from_date = data['from_date']
        to_date = data['to_date']
        today = date.today()

        # Date order check
        if from_date > to_date:
            raise serializers.ValidationError(
                'Start date must be before end date.'
            )

        # Overlapping leave check
        overlapping = LeaveRequest.objects.filter(
            employee=user,
            status__in=[
                'DRAFT', 'SUBMITTED', 'SUPERVISOR_REVIEW',
                'HR_REVIEW', 'HR_CHECK', 'APPROVED'
            ],
            from_date__lte=to_date,
            to_date__gte=from_date
        ).first()

        if overlapping:
            raise serializers.ValidationError(
                f'You already have a {overlapping.leave_type.name} request '
                f'running from {overlapping.from_date} to {overlapping.to_date}. '
                f'An employee can only be on one leave at a time. '
                f'Please wait for your current leave to end or be resolved before applying again.'
            )

        # 14-day advance notice rule (except sick leave)
        is_sick = leave_type.name.lower() in ['sick leave', 'sick']
        if not is_sick and (from_date - today).days < 14:
            raise serializers.ValidationError(
                'Leave must be applied at least 14 days in advance.'
            )

        # Document required check
        if leave_type.requires_document and not data.get('attachment'):
            raise serializers.ValidationError(
                f'{leave_type.name} requires a supporting document upload.'
            )

        # Calculate working days
        days = get_working_days(from_date, to_date)
        if days == 0:
            raise serializers.ValidationError(
                'Selected dates contain no working days.'
            )

        # Balance check
        current_year = today.year
        balance = LeaveBalance.objects.filter(
            employee=user,
            leave_type=leave_type,
            year=current_year
        ).first()

        if balance is None:
            raise serializers.ValidationError(
                f'No leave balance found for {leave_type.name} in {current_year}. '
                f'Contact HR to set up your balance.'
            )

        if days > balance.remaining:
            raise serializers.ValidationError(
                f'Insufficient balance. You have {balance.remaining} days remaining '
                f'but requested {days} days.'
            )

        # Acting officer must be from same department
        acting_officer = data.get('acting_officer')
        if acting_officer:
            if acting_officer.department != user.department:
                raise serializers.ValidationError(
                    'Acting officer must be from the same department.'
                )
            if acting_officer == user:
                raise serializers.ValidationError(
                    'You cannot assign yourself as acting officer.'
                )

        data['_days_requested'] = days
        return data

    def validate_attachment(self, value):
        if value:
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError(
                    'File size must not exceed 5MB.'
                )
            allowed_types = ['application/pdf', 'image/jpeg', 'image/png']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    'Only PDF, JPEG, and PNG files are allowed.'
                )
        return value

    def create(self, validated_data):
        days = validated_data.pop('_days_requested')
        leave_request = LeaveRequest.objects.create(
            employee=self.context['request'].user,
            days_requested=days,
            status='DRAFT',
            **validated_data
        )
        return leave_request