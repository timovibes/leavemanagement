from datetime import date, timedelta
from .models import PublicHoliday


def get_working_days(from_date, to_date):
    """Count days between two dates excluding weekends and public holidays."""
    holidays = set(
        PublicHoliday.objects.filter(
            date__gte=from_date, date__lte=to_date
        ).values_list('date', flat=True)
    )

    count = 0
    current = from_date
    while current <= to_date:
        if current.weekday() < 5 and current not in holidays:  # Mon–Fri
            count += 1
        current += timedelta(days=1)
    return count


def get_next_working_day(from_date):
    """Get the next working day after a given date."""
    holidays = set(
        PublicHoliday.objects.filter(
            date__gte=from_date
        ).values_list('date', flat=True)
    )
    current = from_date + timedelta(days=1)
    while current.weekday() >= 5 or current in holidays:
        current += timedelta(days=1)
    return current