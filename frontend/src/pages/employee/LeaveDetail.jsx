import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useLeaveDetail } from '../../hooks/useLeaves'
import StatusBadge from '../../components/StatusBadge'

const partLabels = {
  II: 'Supervisor Review',
  III: 'HR Calculation',
  IV: 'Allowance',
  V: 'HR Verification',
  VI: 'Final Approval',
}

export default function LeaveDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: leave, isLoading } = useLeaveDetail(id)

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="space-y-3 mt-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!leave) {
    return (
      <div className="page-container text-center py-16">
        <p className="text-gray-400">Leave request not found.</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mt-2 mb-5">
        <button onClick={() => navigate(-1)} className="text-kfs-green">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-kfs-dark text-lg">
            {leave.leave_type_name}
          </h1>
          <p className="text-gray-500 text-xs">
            Application No: LV-{String(leave.id).padStart(5, '0')}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={leave.status} />
          {leave.status === 'APPROVED' && (
            <a
              href={`${import.meta.env.VITE_API_BASE_URL}/leaves/${leave.id}/download-pdf/`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-600
                         border border-blue-300 rounded-lg px-2.5 py-1.5
                         hover:bg-blue-50"
            >
              <Download size={13} /> PDF
            </a>
          )}
        </div>
      </div>

      {/* Part I */}
      <div className="card mb-4">
        <h3 className="section-title">Part I — Employee Details</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {[
            ['Employee', leave.employee_name],
            ['Department', leave.employee_department || '—'],
            ['From', leave.from_date],
            ['To', leave.to_date],
            ['Days', `${leave.days_requested} working days`],
            ['Acting Officer', leave.acting_officer_name || '—'],
            ['Leave Address', leave.leave_address],
            ['Phone', leave.phone_during_leave],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="font-medium text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection reason */}
      {leave.rejection_reason && (
        <div className="card mb-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-2">
            <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-red-700 text-sm">Rejected</p>
              <p className="text-red-600 text-sm mt-0.5">{leave.rejection_reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* HR Calculations */}
      {leave.leave_entitlement !== null && (
        <div className="card mb-4">
          <h3 className="section-title">Part III — HR Calculations</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {[
              ['Entitlement', `${leave.leave_entitlement} days`],
              ['Accumulated', `${leave.accumulated_with_permission} days`],
              ['Taken this year', `${leave.leave_taken_this_year} days`],
              ['Total Due', `${leave.total_days_due} days`],
              ['Balance Remaining', `${leave.balance_remaining} days`],
              ['Resume Date', leave.resume_date || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Allowance */}
      {leave.leave_allowance_ksh && (
        <div className="card mb-4 bg-green-50 border-green-200">
          <h3 className="section-title text-green-800">Part IV — Leave Allowance</h3>
          <p className="text-2xl font-bold text-kfs-green">
            KSh {Number(leave.leave_allowance_ksh).toLocaleString()}
          </p>
          <p className="text-xs text-green-700 mt-1">Payable leave allowance</p>
        </div>
      )}

      {/* Approval trail */}
      {leave.approvals?.length > 0 && (
        <div className="card mb-4">
          <h3 className="section-title">Approval Trail</h3>
          <div className="space-y-3">
            {leave.approvals.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {a.action === 'APPROVED' || a.action === 'VERIFIED' ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800">
                      {partLabels[a.part] || `Part ${a.part}`}
                    </p>
                    <span className={`text-xs font-medium ${
                      a.action === 'REJECTED' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {a.action}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {a.actor_name} • {new Date(a.timestamp).toLocaleString('en-KE')}
                  </p>
                  {a.remarks && (
                    <p className="text-xs text-gray-600 mt-0.5 italic">
                      "{a.remarks}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}