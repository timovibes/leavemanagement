from django.db import models
from django.conf import settings


class LeaveType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    max_days = models.PositiveIntegerField()
    requires_document = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class PublicHoliday(models.Model):
    name = models.CharField(max_length=100)
    date = models.DateField(unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.date})"


class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('SUPERVISOR_REVIEW', 'Supervisor Review'),
        ('HR_REVIEW', 'HR Review'),
        ('HR_CHECK', 'HR Check'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='leave_requests'
    )
    leave_type = models.ForeignKey(
        LeaveType, on_delete=models.PROTECT,
        related_name='requests'
    )
    from_date = models.DateField()
    to_date = models.DateField()
    days_requested = models.PositiveIntegerField(default=0)  # auto-calculated
    leave_address = models.TextField()
    phone_during_leave = models.CharField(max_length=20)
    acting_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='acting_requests'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')

    # Part II — Supervisor
    supervisor_recommended_days = models.PositiveIntegerField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    # Part III — HR (auto-calculated)
    leave_entitlement = models.PositiveIntegerField(null=True, blank=True)
    accumulated_with_permission = models.PositiveIntegerField(default=0)
    leave_taken_this_year = models.PositiveIntegerField(null=True, blank=True)
    total_days_due = models.PositiveIntegerField(null=True, blank=True)
    balance_remaining = models.IntegerField(null=True, blank=True)
    resume_date = models.DateField(null=True, blank=True)  # auto-calculated

    # Part IV — HR allowance
    leave_allowance_ksh = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    # Document upload (sick/maternity)
    attachment = models.FileField(
        upload_to='leave_attachments/%Y/%m/', null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.name} — {self.leave_type.name} ({self.status})"


class LeaveBalance(models.Model):
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='leave_balances'
    )
    leave_type = models.ForeignKey(
        LeaveType, on_delete=models.CASCADE,
        related_name='balances'
    )
    year = models.PositiveIntegerField()
    total_entitlement = models.PositiveIntegerField(default=0)
    accumulated_with_permission = models.PositiveIntegerField(default=0)
    taken = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('employee', 'leave_type', 'year')

    @property
    def remaining(self):
        return self.total_entitlement + self.accumulated_with_permission - self.taken

    def __str__(self):
        return f"{self.employee.name} — {self.leave_type.name} {self.year}"


class ApprovalChain(models.Model):
    PART_CHOICES = [
        ('II', 'Part II — Supervisor'),
        ('III', 'Part III — HR Review'),
        ('IV', 'Part IV — HR Allowance'),
        ('V', 'Part V — HR Officer Verify'),
        ('VI', 'Part VI — Head HR Final'),
    ]
    ACTION_CHOICES = [
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('VERIFIED', 'Verified'),
    ]

    leave_request = models.ForeignKey(
        LeaveRequest, on_delete=models.CASCADE,
        related_name='approvals'
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='approval_actions'
    )
    part = models.CharField(max_length=5, choices=PART_CHOICES)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    remarks = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Part {self.part} — {self.action} by {self.actor.name}"


class AuditLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True,
        on_delete=models.SET_NULL, related_name='audit_logs'
    )
    action = models.CharField(max_length=100)
    target_table = models.CharField(max_length=100)
    target_id = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.actor} — {self.action} on {self.target_table}:{self.target_id}"