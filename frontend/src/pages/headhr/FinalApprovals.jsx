import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CheckCircle, XCircle, ChevronDown,
  ChevronUp, Loader2, Download, Shield
} from 'lucide-react'
import { usePendingHeadHR, useHeadHRApproval } from '../../hooks/useHeadHR'
import StatusBadge from '../../components/ui/StatusBadge'


// ── Final Approval Modal ─────────────────────
function FinalApprovalModal({ leave, onClose }) {
  const approval = useHeadHRApproval()
  const [action, setAction] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    const payload =
      action === 'APPROVE'
        ? { action: 'APPROVE', remarks: data.remarks || 'Final approval granted.' }
        : { action: 'REJECT', rejection_reason: data.rejection_reason }

    await approval.mutateAsync({ id: leave.id, data: payload })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center
                    justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl
                      max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3
                        border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-kfs-green" />
              <h3 className="font-semibold text-gray-800">
                Part VI — Final Approval
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Full summary */}
          <div className="bg-kfs-muted rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-kfs-dark mb-2">
              Leave Summary
            </p>
            {[
              ['Employee',      leave.employee_name],
              ['Department',    leave.employee_department || '—'],
              ['Leave Type',    leave.leave_type_name],
              ['Period',        `${leave.from_date} → ${leave.to_date}`],
              ['Days Requested', leave.days_requested],
              ['Supervisor Rec.', leave.supervisor_recommended_days || leave.days_requested],
              ['Entitlement',   `${leave.leave_entitlement ?? '—'} days`],
              ['Balance Left',  `${leave.balance_remaining ?? '—'} days`],
              ['Resume Date',   leave.resume_date || '—'],
              ['Allowance (KSh)', leave.leave_allowance_ksh
                ? Number(leave.leave_allowance_ksh).toLocaleString()
                : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between
                                          border-b border-gray-100 py-1">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>

          {/* Approval trail so far */}
          {leave.approvals?.length > 0 && (
            <div className="text-xs space-y-1">
              <p className="font-medium text-gray-600 mb-1">Approval Trail:</p>
              {leave.approvals.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-500 shrink-0" />
                  <span className="text-gray-600">
                    Part {a.part} — {a.actor_name} •{' '}
                    {new Date(a.timestamp).toLocaleDateString('en-KE')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          {!action && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAction('APPROVE')}
                className="flex items-center justify-center gap-2 py-3
                           rounded-xl bg-green-50 text-green-700
                           border border-green-200 font-medium text-sm
                           hover:bg-green-100 transition-colors"
              >
                <CheckCircle size={16} /> Approve
              </button>
              <button
                onClick={() => setAction('REJECT')}
                className="flex items-center justify-center gap-2 py-3
                           rounded-xl bg-red-50 text-red-700
                           border border-red-200 font-medium text-sm
                           hover:bg-red-100 transition-colors"
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          )}

          {/* Approve form */}
          {action === 'APPROVE' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center gap-2 text-green-700
                              text-sm font-medium">
                <CheckCircle size={15} /> Granting Final Approval
              </div>
              <div>
                <label className="block text-sm font-medium
                                   text-gray-700 mb-1">
                  Remarks
                  <span className="text-gray-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Final approval remarks..."
                  className="input-field resize-none"
                  {...register('remarks')}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAction(null)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={approval.isPending}
                  className="btn-primary flex items-center justify-center
                             gap-2 bg-green-600 hover:bg-green-700"
                >
                  {approval.isPending && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  Confirm Approval
                </button>
              </div>
            </form>
          )}

          {/* Reject form */}
          {action === 'REJECT' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center gap-2 text-red-700
                              text-sm font-medium">
                <XCircle size={15} /> Rejecting Leave Request
              </div>
              <div>
                <label className="block text-sm font-medium
                                   text-gray-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide a clear reason for rejection..."
                  className={`input-field resize-none ${
                    errors.rejection_reason ? 'border-red-400' : ''
                  }`}
                  {...register('rejection_reason', {
                    required: 'Rejection reason is required',
                    minLength: {
                      value: 10,
                      message: 'Please provide more detail (min 10 chars)'
                    },
                  })}
                />
                {errors.rejection_reason && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.rejection_reason.message}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAction(null)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={approval.isPending}
                  className="btn-danger flex items-center
                             justify-center gap-2"
                >
                  {approval.isPending && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  Confirm Rejection
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


// ── Leave Card ───────────────────────────────
function FinalLeaveCard({ leave }) {
  const [expanded, setExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="card">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-800">
                {leave.employee_name}
              </p>
              <StatusBadge status={leave.status} />
            </div>
            <p className="text-sm text-gray-600 mt-0.5">
              {leave.leave_type_name} •{' '}
              <span className="font-medium text-kfs-green">
                {leave.days_requested} days
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {leave.from_date} → {leave.to_date} •
              Resume: {leave.resume_date || '—'}
            </p>
            {leave.leave_allowance_ksh && (
              <p className="text-xs text-blue-600 mt-0.5">
                Allowance: KSh{' '}
                {Number(leave.leave_allowance_ksh).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary py-1.5 px-3 text-xs w-auto"
            >
              Decide
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
            >
              {expanded
                ? <ChevronUp size={16} />
                : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[
                ['Department',      leave.employee_department || '—'],
                ['Acting Officer',  leave.acting_officer_name || '—'],
                ['Entitlement',     `${leave.leave_entitlement ?? '—'} days`],
                ['Taken This Year', `${leave.leave_taken_this_year ?? '—'} days`],
                ['Balance Left',    `${leave.balance_remaining ?? '—'} days`],
                ['Supervisor Rec.', `${leave.supervisor_recommended_days ?? leave.days_requested} days`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-medium text-gray-700">{value}</p>
                </div>
              ))}
            </div>

            {/* Approval trail */}
            {leave.approvals?.length > 0 && (
              <div className="space-y-1 text-xs text-gray-500">
                <p className="font-medium text-gray-600">Trail:</p>
                {leave.approvals.map((a, i) => (
                  <p key={i}>
                    Part {a.part} — {a.action} by {a.actor_name}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <FinalApprovalModal
          leave={leave}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}


export default function FinalApprovals() {
  const { data: pending = [], isLoading } = usePendingHeadHR()

  return (
    <div className="page-container">
      <div className="mt-2 mb-5">
        <h1 className="text-kfs-dark">Final Approvals</h1>
        <p className="text-gray-500 text-sm">
          {pending.length} request{pending.length !== 1 ? 's' : ''} awaiting
          your decision
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle
            size={40}
            className="mx-auto text-green-300 mb-3"
          />
          <p className="text-gray-500 font-medium">All decisions made!</p>
          <p className="text-gray-400 text-sm mt-1">
            No requests pending final approval.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(leave => (
            <FinalLeaveCard key={leave.id} leave={leave} />
          ))}
        </div>
      )}
    </div>
  )
}