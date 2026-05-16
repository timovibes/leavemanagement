const statusMap = {
  DRAFT:             'badge-draft',
  SUBMITTED:         'badge-pending',
  SUPERVISOR_REVIEW: 'badge-review',
  HR_REVIEW:         'badge-review',
  HR_CHECK:          'badge-review',
  APPROVED:          'badge-approved',
  REJECTED:          'badge-rejected',
}

const labelMap = {
  DRAFT:             'Draft',
  SUBMITTED:         'Submitted',
  SUPERVISOR_REVIEW: 'Supervisor Review',
  HR_REVIEW:         'HR Review',
  HR_CHECK:          'HR Check',
  APPROVED:          'Approved',
  REJECTED:          'Rejected',
}

export default function StatusBadge({ status }) {
  return (
    <span className={statusMap[status] || 'badge'}>
      {labelMap[status] || status}
    </span>
  )
}