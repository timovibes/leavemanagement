import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  ChevronDown, ChevronUp, CheckCircle,
  Calculator, Shield, Loader2, Info, Download
} from 'lucide-react'
import {
  usePendingHR, useHRReview,
  useHRAllowance, useHRVerify
} from '../../hooks/useHR'
import StatusBadge from '../../components/ui/StatusBadge'
import { useLeaveDetail } from '../../hooks/useLeaves'


// ── Part III Modal ───────────────────────────
function PartIIIModal({ leave, onClose }) {
  const hrReview = useHRReview()
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data) => {
    const payload = {}
    if (data.leave_entitlement)
      payload.leave_entitlement = data.leave_entitlement
    if (data.accumulated_with_permission)
      payload.accumulated_with_permission = data.accumulated_with_permission
    if (data.resume_date)
      payload.resume_date = data.resume_date
    if (data.remarks)
      payload.remarks = data.remarks

    await hrReview.mutateAsync({ id: leave.id, data: payload })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center
                    justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl
                      max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3
                        border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-kfs-green" />
              <h3 className="font-semibold text-gray-800">
                Part III — HR Calculations
              </h3>
            </div>
            <button onClick={onClose} className="text-gray-400 text-xl">×</button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Leave summary */}
          <div className="bg-kfs-muted rounded-xl p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Employee</span>
              <span className="font-medium">{leave.employee_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Leave Type</span>
              <span className="font-medium">{leave.leave_type_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Period</span>
              <span className="font-medium">
                {leave.from_date} → {leave.to_date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Days Requested</span>
              <span className="font-medium text-kfs-green">
                {leave.days_requested}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Supervisor Recommended</span>
              <span className="font-medium">
                {leave.supervisor_recommended_days || leave.days_requested}
              </span>
            </div>

            {/* Supporting document */}
            {leave.attachment && (
              <a
                href={`${import.meta.env.VITE_MEDIA_BASE_URL}${leave.attachment}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline pt-1"
              >
                <Download size={12} /> View Supporting Document
              </a>
            )}
          </div>

          <div className="flex items-start gap-2 text-xs text-blue-700
                          bg-blue-50 px-3 py-2 rounded-lg">
            <Info size={13} className="mt-0.5 shrink-0" />
            Fields are auto-calculated. Override only if necessary —
            overrides are logged in the audit trail.
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Entitlement (days)
                <span className="text-gray-400 font-normal ml-1">(override)</span>
              </label>
              <input
                type="number"
                placeholder="Leave blank to use system value"
                className="input-field"
                {...register('leave_entitlement')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accumulated With Permission
                <span className="text-gray-400 font-normal ml-1">(override)</span>
              </label>
              <input
                type="number"
                placeholder="Leave blank to use system value"
                className="input-field"
                {...register('accumulated_with_permission')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resume Duty Date
                <span className="text-gray-400 font-normal ml-1">(override)</span>
              </label>
              <input
                type="date"
                className="input-field"
                {...register('resume_date')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Optional remarks..."
                className="input-field resize-none"
                {...register('remarks')}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={hrReview.isPending}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {hrReview.isPending && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Complete Part III
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


// ── Part IV Modal ────────────────────────────
function PartIVModal({ leave, onClose }) {
  const hrAllowance = useHRAllowance()
  const { register, handleSubmit } = useForm()

  const approvedDays =
    leave.supervisor_recommended_days || leave.days_requested
  const dailyRate = leave.employee_salary_band
    ? (parseFloat(leave.employee_salary_band) / 30).toFixed(2)
    : '—'
  const calculated = leave.employee_salary_band
    ? ((parseFloat(leave.employee_salary_band) / 30) * approvedDays).toFixed(2)
    : '—'

  const onSubmit = async (data) => {
    const payload = {}
    if (data.leave_allowance_ksh)
      payload.leave_allowance_ksh = data.leave_allowance_ksh
    if (data.remarks) payload.remarks = data.remarks
    await hrAllowance.mutateAsync({ id: leave.id, data: payload })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center
                    justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl
                      max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3
                        border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-blue-500" />
              <h3 className="font-semibold text-gray-800">
                Part IV — Leave Allowance
              </h3>
            </div>
            <button onClick={onClose} className="text-gray-400 text-xl">×</button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Calculation breakdown */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-blue-800 mb-2">
              Auto-Calculation Breakdown
            </p>
            {[
              ['Approved Days', approvedDays],
              ['Daily Rate (KSh)', dailyRate],
              ['Calculated Allowance (KSh)', calculated],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-blue-700">{label}</span>
                <span className="font-semibold text-blue-900">{value}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Override Allowance (KSh)
                <span className="text-gray-400 font-normal ml-1">
                  (leave blank to use calculated)
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder={calculated}
                className="input-field"
                {...register('leave_allowance_ksh')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                rows={2}
                className="input-field resize-none"
                {...register('remarks')}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={hrAllowance.isPending}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {hrAllowance.isPending && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Confirm Allowance
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


// ── Part V Modal ─────────────────────────────
function PartVModal({ leave, onClose }) {
  const hrVerify = useHRVerify()
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data) => {
    await hrVerify.mutateAsync({
      id: leave.id,
      data: { remarks: data.remarks || 'All parts verified by HR Officer.' }
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center
                    justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-purple-600" />
              <h3 className="font-semibold text-gray-800">
                Part V — HR Officer Verification
              </h3>
            </div>
            <button onClick={onClose} className="text-gray-400 text-xl">×</button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Full summary */}
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-700 mb-2">
              Confirm all parts are correctly filled:
            </p>
            {[
              ['Employee', leave.employee_name],
              ['Leave Type', leave.leave_type_name],
              ['Period', `${leave.from_date} → ${leave.to_date}`],
              ['Days', leave.days_requested],
              ['Entitlement', leave.leave_entitlement ?? '—'],
              ['Balance Remaining', leave.balance_remaining ?? '—'],
              ['Resume Date', leave.resume_date ?? '—'],
              ['Allowance (KSh)',
                leave.leave_allowance_ksh
                  ? Number(leave.leave_allowance_ksh).toLocaleString()
                  : '—'
              ],
            ].map(([label, value]) => (
              <div key={label}
                className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>

          {!leave.leave_allowance_ksh && (
            <div className="flex items-start gap-2 text-xs text-red-700
                            bg-red-50 px-3 py-2 rounded-lg">
              <Info size={13} className="mt-0.5 shrink-0" />
              Complete Part IV (allowance) before verifying.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Remarks
              </label>
              <textarea
                rows={2}
                defaultValue="All parts verified by HR Officer."
                className="input-field resize-none"
                {...register('remarks')}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={hrVerify.isPending || !leave.leave_allowance_ksh}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {hrVerify.isPending && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Verify & Forward to Head HR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


// ── Leave Request Card ───────────────────────
function HRLeaveCard({ leave }) {
  const [expanded, setExpanded] = useState(false)
  const [modal, setModal] = useState(null) // 'III' | 'IV' | 'V'

  const hasPartIII = leave.leave_entitlement !== null
  const hasPartIV  = leave.leave_allowance_ksh !== null
  const hasPartV   = leave.approvals?.some(a => a.part === 'V')

  const nextAction =
    !hasPartIII ? 'III' :
    !hasPartIV  ? 'IV'  :
    !hasPartV   ? 'V'   : null

  const actionLabels = {
    III: { label: 'Part III', color: 'bg-yellow-500' },
    IV:  { label: 'Part IV',  color: 'bg-blue-500' },
    V:   { label: 'Part V',   color: 'bg-purple-600' },
  }

  return (
    <>
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

            {/* Parts progress */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {['III', 'IV', 'V'].map(part => {
                const done =
                  part === 'III' ? hasPartIII :
                  part === 'IV'  ? hasPartIV  : hasPartV
                return (
                  <span
                    key={part}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      done
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {done ? '✓' : '○'} Part {part}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {nextAction && (
              <button
                onClick={() => setModal(nextAction)}
                className={`text-white text-xs px-3 py-1.5 rounded-lg font-medium
                            ${actionLabels[nextAction].color} hover:opacity-90
                            transition-opacity`}
              >
                {actionLabels[nextAction].label}
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[
                ['Department', leave.employee_department || '—'],
                ['Supervisor Recommended',
                  `${leave.supervisor_recommended_days || leave.days_requested} days`],
                ['Entitlement', leave.leave_entitlement !== null
                  ? `${leave.leave_entitlement} days` : '—'],
                ['Balance Remaining', leave.balance_remaining !== null
                  ? `${leave.balance_remaining} days` : '—'],
                ['Resume Date', leave.resume_date || '—'],
                ['Allowance (KSh)', leave.leave_allowance_ksh
                  ? Number(leave.leave_allowance_ksh).toLocaleString() : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-medium text-gray-700">{value}</p>
                </div>
              ))}
            </div>

            {/* All parts action buttons */}
            <div className="flex gap-2 flex-wrap pt-1">
              <button
                onClick={() => setModal('III')}
                className="text-xs px-3 py-1.5 rounded-lg border border-yellow-300
                           text-yellow-700 hover:bg-yellow-50"
              >
                {hasPartIII ? '✓ Re-do Part III' : 'Part III'}
              </button>
              <button
                onClick={() => setModal('IV')}
                disabled={!hasPartIII}
                className="text-xs px-3 py-1.5 rounded-lg border border-blue-300
                           text-blue-700 hover:bg-blue-50
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {hasPartIV ? '✓ Re-do Part IV' : 'Part IV'}
              </button>
              <button
                onClick={() => setModal('V')}
                disabled={!hasPartIV}
                className="text-xs px-3 py-1.5 rounded-lg border border-purple-300
                           text-purple-700 hover:bg-purple-50
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {hasPartV ? '✓ Re-verify Part V' : 'Part V'}
              </button>
            </div>

            {/* Approval trail */}
            {leave.approvals?.length > 0 && (
              <div className="text-xs text-gray-500 space-y-1 pt-1">
                <p className="font-medium text-gray-600">Trail:</p>
                {leave.approvals.map((a, i) => (
                  <p key={i}>
                    Part {a.part} — {a.action} by {a.actor_name}{' '}
                    ({new Date(a.timestamp).toLocaleDateString('en-KE')})
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {modal === 'III' && (
        <PartIIIModal leave={leave} onClose={() => setModal(null)} />
      )}
      {modal === 'IV' && (
        <PartIVModal leave={leave} onClose={() => setModal(null)} />
      )}
      {modal === 'V' && (
        <PartVModal leave={leave} onClose={() => setModal(null)} />
      )}
    </>
  )
}


export default function HRQueue() {
  const { data: pending = [], isLoading } = usePendingHR()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? pending
    : pending.filter(l => l.status === filter)

  return (
    <div className="page-container">
      <div className="mt-2 mb-5">
        <h1 className="text-kfs-dark">HR Queue</h1>
        <p className="text-gray-500 text-sm">
          {pending.length} request{pending.length !== 1 ? 's' : ''} need HR action
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: 'all',       label: 'All' },
          { key: 'HR_REVIEW', label: 'Needs Review' },
          { key: 'HR_CHECK',  label: 'In Check' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium
                        whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-kfs-green text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
            {key === 'all' && ` (${pending.length})`}
            {key !== 'all' && ` (${pending.filter(l => l.status === key).length})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-28 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle size={40} className="mx-auto text-green-300 mb-3" />
          <p className="text-gray-500 font-medium">Queue is clear!</p>
          <p className="text-gray-400 text-sm mt-1">
            No requests need HR action right now.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(leave => (
            <HRLeaveCard key={leave.id} leave={leave} />
          ))}
        </div>
      )}
    </div>
  )
}