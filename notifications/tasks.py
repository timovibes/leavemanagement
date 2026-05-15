from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

Employee = get_user_model()


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_notification(self, recipient_email, subject, message):
    """Send a single email — retries up to 3 times on failure."""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task
def notify_supervisor_of_submission(leave_request_id):
    from leaves.models import LeaveRequest
    try:
        lr = LeaveRequest.objects.select_related(
            'employee', 'employee__department', 'leave_type'
        ).get(id=leave_request_id)

        supervisor = lr.employee.department.head if lr.employee.department else None
        if not supervisor:
            return

        subject = f'[KFS Leave] New Leave Request — {lr.employee.name}'
        message = (
            f'Dear {supervisor.name},\n\n'
            f'{lr.employee.name} ({lr.employee.personal_number}) has submitted '
            f'a {lr.leave_type.name} request.\n\n'
            f'Details:\n'
            f'  From:  {lr.from_date}\n'
            f'  To:    {lr.to_date}\n'
            f'  Days:  {lr.days_requested}\n\n'
            f'Please log in to review:\n'
            f'{settings.FRONTEND_URL}/supervisor/pending\n\n'
            f'Kenya Forest Service Leave System'
        )
        send_email_notification.delay(supervisor.email, subject, message)

    except LeaveRequest.DoesNotExist:
        pass


@shared_task
def notify_employee_status_change(leave_request_id, new_status, extra_message=''):
    from leaves.models import LeaveRequest
    try:
        lr = LeaveRequest.objects.select_related(
            'employee', 'leave_type'
        ).get(id=leave_request_id)

        status_labels = {
            'SUPERVISOR_REVIEW': 'forwarded to your Supervisor for review',
            'HR_REVIEW':         'approved by your Supervisor and forwarded to HR',
            'HR_CHECK':          'under review by HR',
            'APPROVED':          'FULLY APPROVED',
            'REJECTED':          'REJECTED',
        }
        label = status_labels.get(new_status, new_status)

        subject = f'[KFS Leave] Your Leave Request has been {label}'
        message = (
            f'Dear {lr.employee.name},\n\n'
            f'Your {lr.leave_type.name} request ({lr.from_date} to {lr.to_date}) '
            f'has been {label}.\n\n'
        )

        if extra_message:
            message += f'{extra_message}\n\n'

        if new_status == 'APPROVED':
            message += (
                f'Resume Date: {lr.resume_date}\n'
                f'Leave Allowance: KSh {lr.leave_allowance_ksh}\n\n'
            )

        message += (
            f'Log in to view details:\n'
            f'{settings.FRONTEND_URL}/my-leaves\n\n'
            f'Kenya Forest Service Leave System'
        )

        send_email_notification.delay(lr.employee.email, subject, message)

    except LeaveRequest.DoesNotExist:
        pass


@shared_task
def notify_hr_of_supervisor_approval(leave_request_id):
    from leaves.models import LeaveRequest
    from accounts.models import Employee as Emp
    try:
        lr = LeaveRequest.objects.select_related(
            'employee', 'leave_type'
        ).get(id=leave_request_id)

        hr_team = Emp.objects.filter(role__in=['HR_OFFICER', 'HEAD_HR'])
        subject = f'[KFS Leave] Supervisor Approved — {lr.employee.name}'
        message = (
            f'Dear HR Team,\n\n'
            f'{lr.employee.name} — {lr.leave_type.name} request has been '
            f'approved by the Supervisor and requires HR review.\n\n'
            f'  Days Recommended: {lr.supervisor_recommended_days}\n'
            f'  From: {lr.from_date}  To: {lr.to_date}\n\n'
            f'Please log in to process:\n'
            f'{settings.FRONTEND_URL}/hr/pending\n\n'
            f'Kenya Forest Service Leave System'
        )
        for hr in hr_team:
            send_email_notification.delay(hr.email, subject, message)

    except LeaveRequest.DoesNotExist:
        pass


@shared_task
def notify_head_hr_for_final_approval(leave_request_id):
    from leaves.models import LeaveRequest
    from accounts.models import Employee as Emp
    try:
        lr = LeaveRequest.objects.select_related(
            'employee', 'leave_type'
        ).get(id=leave_request_id)

        heads = Emp.objects.filter(role='HEAD_HR')
        subject = f'[KFS Leave] Final Approval Required — {lr.employee.name}'
        message = (
            f'Dear Head of HR,\n\n'
            f'The following leave request has been verified by the HR Officer '
            f'and requires your final approval.\n\n'
            f'  Employee:  {lr.employee.name} ({lr.employee.personal_number})\n'
            f'  Type:      {lr.leave_type.name}\n'
            f'  From:      {lr.from_date}\n'
            f'  To:        {lr.to_date}\n'
            f'  Days:      {lr.days_requested}\n'
            f'  Allowance: KSh {lr.leave_allowance_ksh}\n\n'
            f'Please log in to approve or reject:\n'
            f'{settings.FRONTEND_URL}/head-hr/pending\n\n'
            f'Kenya Forest Service Leave System'
        )
        for head in heads:
            send_email_notification.delay(head.email, subject, message)

    except LeaveRequest.DoesNotExist:
        pass