from celery import shared_task


@shared_task
def generate_leave_pdf_task(leave_request_id):
    from .models import LeaveRequest
    from .pdf_generator import generate_leave_pdf
    from django.core.files.base import ContentFile
    import os

    try:
        leave_request = LeaveRequest.objects.select_related(
            'employee', 'employee__department',
            'leave_type', 'acting_officer'
        ).prefetch_related('approvals__actor').get(id=leave_request_id)

        pdf_buffer = generate_leave_pdf(leave_request)

        filename = f'leave_form_LV{leave_request_id:05d}.pdf'
        save_path = os.path.join('leave_pdfs', filename)

        # Save to media/leave_pdfs/
        from django.core.files.storage import default_storage
        default_storage.save(save_path, ContentFile(pdf_buffer.read()))

        # Store path on the leave request
        leave_request.attachment = save_path
        leave_request.save(update_fields=['attachment'])

        return f'PDF generated: {save_path}'

    except LeaveRequest.DoesNotExist:
        return f'LeaveRequest {leave_request_id} not found'
    except Exception as e:
        return f'PDF generation failed: {str(e)}'