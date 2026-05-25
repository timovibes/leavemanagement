from .models import Notification


def create_notification(user, message):
    """Create an in-app notification."""
    Notification.objects.create(user=user, message=message)


def notify_and_email(user, message, email_subject, email_body):
    """Create in-app notification AND queue email via Celery."""
    create_notification(user=user, message=message)
    from .tasks import send_email_notification
    send_email_notification.delay(user.email, email_subject, email_body)