import { useState } from 'react'
import {
  CheckCircle, XCircle, Clock, ChevronDown,
  ChevronUp, User, Calendar, Phone, MapPin, Loader2
} from 'lucide-react'
import { usePendingSupervisor, useSupervisorReview } from '../../hooks/useSupervisor'
import StatusBadge from '../../components/ui/StatusBadge'
import { useForm } from 'react-hook-form'

function ReviewModal({ leave, onClose }) {
  const review = useSupervisorReview()
  const [action, setAction] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { recommended_days: leave.days_requested }
  })

  const onSubmit = async (data) => {
    const payload =
      action === 'APPROVE'
        ? {
            action: 'APPROVE',
            recommended_days: data.recommended_days,
            remarks: data.remarks || '',
          }
        : {
            action: 'REJECT',
            rejection_reason: data.rejection_reason,
          }

    await review.mutateAsync({ id: leave.id, data: payload })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center
                    justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl
                      max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Part II — Supervisor Review</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Leave summary */}
          <div className="bg-kfs-muted rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-kfs-dark">{leave.employee_name}</p>
              <StatusBadge status={leave.status} />
            </div>
            <p className="text-sm text-gray-600">{leave.leave_type_name}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {leave.from_date} → {leave.to_date}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                {leave.days_requested} working days
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span className="truncate">{leave.leave_address}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone size={12} />
                {leave.phone_during_leave}
              </div>
            </div>
            {leave.acting_officer_name && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User size={12} />
                Acting: {leave.acting_officer_name}
              </div>
            )}
          </div>

          {/* Action buttons */}
          {!action && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAction('APPROVE')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl
                           bg-green-50 text-green-700 border border-green-200
                           font-medium text-sm hover:bg-green-100 transition-colors"
              >
                <CheckCircle size={16} /> Approve
              </button>
              <button
                onClick={() => setAction('REJECT')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl
                           bg-red-50 text-red-700 border border-red-200
                           font-medium text-sm hover:bg-red-100 transition-colors"
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          )}

          {/* Approve form */}
          {action === 'APPROVE' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                <CheckCircle size={15} /> Approving Leave
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommended Days
                  <span className="text-gray-400 font-normal ml-1">
                    (can differ from requested {leave.days_requested})
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={leave.days_requested}
                  className={`input-field ${errors.recommended_days ? 'border-red-400' : ''}`}
                  {...register('recommended_days', {
                    required: 'Required',
                    min: { value: 1, message: 'Minimum 1 day' },
                    max: {
                      value: leave.days_requested,
                      message: `Cannot exceed requested ${leave.days_requested} days`
                    },
                  })}
                />
                {errors.recommended_days && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.recommended_days.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Any comments for HR..."
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
                  disabled={review.isPending}
                  className="btn-primary flex items-center justify-center gap-2
                             bg-green-600 hover:bg-green-700"
                >
                  {review.isPending && <Loader2 size={15} className="animate-spin" />}
                  Confirm Approval
                </button>
              </div>
            </form>
          )}

          {/* Reject form */}
          {action === 'REJECT' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                <XCircle size={15} /> Rejecting Leave
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this leave is being rejected..."
                  className={`input-field resize-none ${
                    errors.rejection_reason ? 'border-red-400' : ''
                  }`}
                  {...register('rejection_reason', {
                    required: 'Rejection reason is required',
                    minLength: {
                      value: 10,
                      message: 'Please provide a detailed reason (min 10 chars)'
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
                  disabled={review.isPending}
                  className="btn-danger flex items-center justify-center gap-2"
                >
                  {review.isPending && <Loader2 size={15} className="animate-spin" />}
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


function LeaveCard({ leave, onReview }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-800">{leave.employee_name}</p>
            <StatusBadge status={leave.status} />
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {leave.leave_type_name} •{' '}
            <span className="font-medium text-kfs-green">
              {leave.days_requested} days
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {leave.from_date} → {leave.to_date}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onReview(leave)}
            className="btn-primary py-1.5 px-3 text-xs w-auto"
          >
            Review
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2
                        gap-x-4 gap-y-2 text-sm">
          {[
            ['Department', leave.employee_department || '—'],
            ['Acting Officer', leave.acting_officer_name || '—'],
            ['Leave Address', leave.leave_address],
            ['Phone', leave.phone_during_leave],
            ['Applied On', new Date(leave.created_at).toLocaleDateString('en-KE')],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-gray-700 font-medium">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


export default function PendingApprovals() {
  const { data: pending = [], isLoading } = usePendingSupervisor()
  const [selectedLeave, setSelectedLeave] = useState(null)

  return (
    <div className="page-container">
      <div className="mt-2 mb-5">
        <h1 className="text-kfs-dark">Pending Approvals</h1>
        <p className="text-gray-500 text-sm">
          {pending.length} request{pending.length !== 1 ? 's' : ''} awaiting your review
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle size={40} className="mx-auto text-green-300 mb-3" />
          <p className="text-gray-500 font-medium">All caught up!</p>
          <p className="text-gray-400 text-sm mt-1">
            No pending leave requests from your team.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(leave => (
            <LeaveCard
              key={leave.id}
              leave={leave}
              onReview={setSelectedLeave}
            />
          ))}
        </div>
      )}

      {selectedLeave && (
        <ReviewModal
          leave={selectedLeave}
          onClose={() => setSelectedLeave(null)}
        />
      )}
    </div>
  )
}