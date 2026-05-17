from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model

Employee = get_user_model()


@receiver(post_save, sender=Employee)
def create_leave_balances(sender, instance, created, **kwargs):
    if not created:
        return

    # Import here to avoid circular imports
    from leaves.models import LeaveType, LeaveBalance

    current_year = timezone.now().year
    leave_types = LeaveType.objects.all()

    for leave_type in leave_types:
        LeaveBalance.objects.get_or_create(
            employee=instance,
            leave_type=leave_type,
            year=current_year,
            defaults={'total_entitlement': leave_type.max_days}
        )