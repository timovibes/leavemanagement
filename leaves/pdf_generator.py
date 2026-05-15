from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime


# ─────────────────────────────────────────────
# Styles
# ─────────────────────────────────────────────
def get_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name='DocTitle',
        fontSize=13,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name='DocSubTitle',
        fontSize=10,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontSize=9,
        fontName='Helvetica-Bold',
        alignment=TA_LEFT,
        spaceAfter=3,
        spaceBefore=6,
        textColor=colors.white,
        backColor=colors.HexColor('#2d6a4f'),
    ))
    styles.add(ParagraphStyle(
        name='FieldLabel',
        fontSize=8,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#333333'),
    ))
    styles.add(ParagraphStyle(
        name='FieldValue',
        fontSize=8,
        fontName='Helvetica',
        textColor=colors.black,
    ))
    styles.add(ParagraphStyle(
        name='Footer',
        fontSize=7,
        fontName='Helvetica',
        alignment=TA_CENTER,
        textColor=colors.grey,
    ))
    styles.add(ParagraphStyle(
        name='Stamp',
        fontSize=7,
        fontName='Helvetica',
        alignment=TA_LEFT,
        textColor=colors.HexColor('#555555'),
    ))
    return styles


# ─────────────────────────────────────────────
# Table style helper
# ─────────────────────────────────────────────
def field_table_style():
    return TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f4f0')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2d6a4f')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#cccccc')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ])


def section_header(text, styles):
    return Table(
        [[Paragraph(f'  {text}', styles['SectionHeader'])]],
        colWidths=[170 * mm],
        style=TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#2d6a4f')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ])
    )


# ─────────────────────────────────────────────
# Main PDF builder
# ─────────────────────────────────────────────
def generate_leave_pdf(leave_request):
    """
    Generate a complete KFS Leave Application Form PDF.
    Returns a BytesIO object.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = get_styles()
    story = []
    W = 170 * mm  # usable width

    # ── Header ──────────────────────────────────
    story.append(Paragraph('KENYA FOREST SERVICE', styles['DocTitle']))
    story.append(Paragraph('LEAVE APPLICATION FORM', styles['DocSubTitle']))
    story.append(Paragraph(
        f'Application No: LV-{leave_request.id:05d}',
        styles['DocSubTitle']
    ))
    story.append(HRFlowable(width=W, thickness=1.5, color=colors.HexColor('#2d6a4f')))
    story.append(Spacer(1, 4 * mm))

    # ── PART I — Employee Details ────────────────
    story.append(section_header('PART I — EMPLOYEE DETAILS (Employee fills)', styles))
    story.append(Spacer(1, 2 * mm))

    emp = leave_request.employee
    col = W / 2

    part1_data = [
        ['Full Name', emp.name,
         'Personal No.', emp.personal_number],
        ['Designation', emp.designation,
         'Grade', emp.grade or '—'],
        ['Department', emp.department.name if emp.department else '—',
         'Salary Band (KSh/mo)', f'{emp.salary_band:,.2f}'],
        ['Leave Type', leave_request.leave_type.name,
         'Days Applied For', str(leave_request.days_requested)],
        ['From Date', str(leave_request.from_date),
         'To Date', str(leave_request.to_date)],
        ['Leave Address', leave_request.leave_address,
         'Phone During Leave', leave_request.phone_during_leave],
        ['Acting Officer',
         leave_request.acting_officer.name if leave_request.acting_officer else '—',
         'Application Date', str(leave_request.created_at.date())],
    ]

    t1 = Table(part1_data, colWidths=[col * 0.3, col * 0.7, col * 0.3, col * 0.7])
    t1.setStyle(field_table_style())
    story.append(t1)
    story.append(Spacer(1, 4 * mm))

    # ── PART II — Supervisor ─────────────────────
    story.append(section_header('PART II — SUPERVISOR / HOD REVIEW', styles))
    story.append(Spacer(1, 2 * mm))

    sup_approval = leave_request.approvals.filter(part='II').first()
    sup_action = sup_approval.action if sup_approval else 'PENDING'
    sup_actor = sup_approval.actor.name if sup_approval else '—'
    sup_designation = sup_approval.actor.designation if sup_approval else '—'
    sup_time = sup_approval.timestamp.strftime('%d %b %Y %H:%M') if sup_approval else '—'
    sup_remarks = sup_approval.remarks if sup_approval else '—'

    part2_data = [
        ['Decision', sup_action,
         'Recommended Days', str(leave_request.supervisor_recommended_days or '—')],
        ['Remarks / Rejection Reason', sup_remarks, '', ''],
        ['Supervisor Name', sup_actor,
         'Designation', sup_designation],
        ['Timestamp', sup_time, '', ''],
    ]

    t2 = Table(part2_data, colWidths=[col * 0.3, col * 0.7, col * 0.3, col * 0.7])
    t2.setStyle(field_table_style())
    story.append(t2)
    story.append(Spacer(1, 4 * mm))

    # ── PART III — HR Calculations ───────────────
    story.append(section_header('PART III — HR DIVISION (Auto-Calculated)', styles))
    story.append(Spacer(1, 2 * mm))

    hr_approval = leave_request.approvals.filter(part='III').first()
    hr_actor = hr_approval.actor.name if hr_approval else '—'
    hr_time = hr_approval.timestamp.strftime('%d %b %Y %H:%M') if hr_approval else '—'

    part3_data = [
        ['Leave Entitlement (days)',
         str(leave_request.leave_entitlement or '—'),
         'Accumulated With Permission',
         str(leave_request.accumulated_with_permission or 0)],
        ['Leave Taken This Year',
         str(leave_request.leave_taken_this_year or '—'),
         'Total Days Due',
         str(leave_request.total_days_due or '—')],
        ['Days Requested',
         str(leave_request.days_requested),
         'Balance Remaining',
         str(leave_request.balance_remaining or '—')],
        ['Resume Duty Date',
         str(leave_request.resume_date or '—'),
         'Computed By', hr_actor],
        ['HR Review Timestamp', hr_time, '', ''],
    ]

    t3 = Table(part3_data, colWidths=[col * 0.35, col * 0.65, col * 0.35, col * 0.65])
    t3.setStyle(field_table_style())
    story.append(t3)
    story.append(Spacer(1, 4 * mm))

    # ── PART IV — Allowance ──────────────────────
    story.append(section_header('PART IV — PAYABLE LEAVE ALLOWANCE', styles))
    story.append(Spacer(1, 2 * mm))

    allow_approval = leave_request.approvals.filter(part='IV').first()
    allow_actor = allow_approval.actor.name if allow_approval else '—'
    allow_time = allow_approval.timestamp.strftime('%d %b %Y %H:%M') if allow_approval else '—'

    daily_rate = float(emp.salary_band) / 30
    approved_days = leave_request.supervisor_recommended_days or leave_request.days_requested

    part4_data = [
        ['Monthly Salary Band (KSh)',
         f'{float(emp.salary_band):,.2f}',
         'Daily Rate (KSh)', f'{daily_rate:,.2f}'],
        ['Approved Days',
         str(approved_days),
         'Leave Allowance Payable (KSh)',
         f'{float(leave_request.leave_allowance_ksh or 0):,.2f}'],
        ['Computed By', allow_actor, 'Timestamp', allow_time],
    ]

    t4 = Table(part4_data, colWidths=[col * 0.35, col * 0.65, col * 0.35, col * 0.65])
    t4.setStyle(field_table_style())
    story.append(t4)
    story.append(Spacer(1, 4 * mm))

    # ── PART V — HR Officer Verify ───────────────
    story.append(section_header('PART V — HR OFFICER VERIFICATION', styles))
    story.append(Spacer(1, 2 * mm))

    v_approval = leave_request.approvals.filter(part='V').first()
    v_actor = v_approval.actor.name if v_approval else '—'
    v_designation = v_approval.actor.designation if v_approval else '—'
    v_time = v_approval.timestamp.strftime('%d %b %Y %H:%M') if v_approval else '—'
    v_remarks = v_approval.remarks if v_approval else '—'

    part5_data = [
        ['Verified By', v_actor, 'Designation', v_designation],
        ['Remarks', v_remarks, 'Timestamp', v_time],
    ]

    t5 = Table(part5_data, colWidths=[col * 0.3, col * 0.7, col * 0.3, col * 0.7])
    t5.setStyle(field_table_style())
    story.append(t5)
    story.append(Spacer(1, 4 * mm))

    # ── PART VI — Head HR Final Approval ────────
    story.append(section_header('PART VI — HEAD OF HUMAN RESOURCE (Final Approval)', styles))
    story.append(Spacer(1, 2 * mm))

    final_approval = leave_request.approvals.filter(part='VI').first()
    final_action = final_approval.action if final_approval else 'PENDING'
    final_actor = final_approval.actor.name if final_approval else '—'
    final_designation = final_approval.actor.designation if final_approval else '—'
    final_time = final_approval.timestamp.strftime('%d %b %Y %H:%M') if final_approval else '—'
    final_remarks = final_approval.remarks if final_approval else '—'

    action_color = '#27ae60' if final_action == 'APPROVED' else '#e74c3c'

    part6_data = [
        ['Final Decision', final_action, 'Head of HR', final_actor],
        ['Designation', final_designation, 'Timestamp', final_time],
        ['Remarks', final_remarks, '', ''],
    ]

    t6 = Table(part6_data, colWidths=[col * 0.3, col * 0.7, col * 0.3, col * 0.7])
    style6 = field_table_style()
    style6.add('TEXTCOLOR', (1, 0), (1, 0), colors.HexColor(action_color))
    style6.add('FONTNAME', (1, 0), (1, 0), 'Helvetica-Bold')
    t6.setStyle(style6)
    story.append(t6)
    story.append(Spacer(1, 6 * mm))

    # ── Approval Trail ───────────────────────────
    story.append(HRFlowable(width=W, thickness=0.5, color=colors.HexColor('#cccccc')))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph('APPROVAL TRAIL', styles['DocSubTitle']))
    story.append(Spacer(1, 2 * mm))

    trail_data = [['Part', 'Action', 'Actor', 'Designation', 'Timestamp', 'Remarks']]
    for approval in leave_request.approvals.order_by('timestamp'):
        trail_data.append([
            f'Part {approval.part}',
            approval.action,
            approval.actor.name,
            approval.actor.designation or '—',
            approval.timestamp.strftime('%d %b %Y %H:%M'),
            (approval.remarks[:40] + '...') if len(approval.remarks) > 40 else approval.remarks
        ])

    trail_col_widths = [15*mm, 20*mm, 35*mm, 35*mm, 35*mm, 30*mm]
    t_trail = Table(trail_data, colWidths=trail_col_widths)
    t_trail.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d6a4f')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#cccccc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_trail)
    story.append(Spacer(1, 6 * mm))

    # ── Official Stamp Placeholder ───────────────
    stamp_data = [[
        Paragraph('[ OFFICIAL STAMP ]', ParagraphStyle(
            'Stamp', fontSize=9, fontName='Helvetica-Bold',
            alignment=TA_CENTER, textColor=colors.HexColor('#999999')
        )),
        Paragraph(
            f'Generated by KFS Leave Management System\n'
            f'Date: {datetime.now().strftime("%d %b %Y %H:%M")}\n'
            f'Status: {leave_request.status}',
            styles['Footer']
        )
    ]]
    t_stamp = Table(stamp_data, colWidths=[W * 0.4, W * 0.6])
    t_stamp.setStyle(TableStyle([
        ('BOX', (0, 0), (0, 0), 1, colors.HexColor('#999999')),
        ('ALIGN', (0, 0), (0, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_stamp)

    doc.build(story)
    buffer.seek(0)
    return buffer