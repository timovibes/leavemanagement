import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Loader2, Upload, X, Info, CalendarDays } from 'lucide-react'
import { useLeaveTypes, useApplyLeave, useCalculateDays, useLeaveBalances } from '../../hooks/useLeaves'
import useAuthStore from '../../store/authStore'
import api from '../../services/axios'

const currentYear = new Date().getFullYear()

export default function ApplyLeave() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: leaveTypes = [] } = useLeaveTypes()
  const { data: balances = [] } = useLeaveBalances(currentYear)
  const applyLeave = useApplyLeave()
  const calcDays = useCalculateDays()

  const [workingDays, setWorkingDays] = useState(null)
  const [colleagues, setColleagues] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [loadingDays, setLoadingDays] = useState(false)

  const {
    register, handleSubmit, watch, control,
    formState: { errors, isSubmitting }
  } = useForm()

  const watchFrom = watch('from_date')
  const watchTo = watch('to_date')
  const watchType = watch('leave_type')

  const selectedType = leaveTypes.find(t => String(t.id) === String(watchType))
  const selectedBalance = balances.find(b => String(b.leave_type) === String(watchType))

  // Calculate working days when dates change
  useEffect(() => {
    if (watchFrom && watchTo && watchFrom <= watchTo) {
      setLoadingDays(true)
      calcDays.mutate(
        { from_date: watchFrom, to_date: watchTo },
        {
          onSuccess: (days) => { setWorkingDays(days); setLoadingDays(false) },
          onError: () => setLoadingDays(false),
        }
      )
    } else {
      setWorkingDays(null)
    }
  }, [watchFrom, watchTo])

  // Load colleagues from same dept
  useEffect(() => {
    if (user?.department) {
      api.get(`/auth/employees/?department=${user.department}`)
        .then(r => {
          const data = r.data?.results || r.data || []
          setColleagues(data.filter(e => e.id !== user.id))
        })
        .catch(() => {})
    }
  }, [user])

  // Min date — 14 days from today (except sick leave)
  const isSick = selectedType?.name?.toLowerCase().includes('sick')
  const today = new Date()
  const minDate = isSick
    ? today.toISOString().split('T')[0]
    : new Date(today.setDate(today.getDate() + 14)).toISOString().split('T')[0]

  const onSubmit = async (data) => {
    const formData = new FormData()
    formData.append('leave_type', data.leave_type)
    formData.append('from_date', data.from_date)
    formData.append('to_date', data.to_date)
    formData.append('leave_address', data.leave_address)
    formData.append('phone_during_leave', data.phone_during_leave)
    if (data.acting_officer) formData.append('acting_officer', data.acting_officer)
    if (selectedFile) formData.append('attachment', selectedFile)

    const result = await applyLeave.mutateAsync(formData).catch(() => null)
    if (result) navigate('/my-leaves')
  }

  return (
    <div className="page-container">
      <div className="mb-5 mt-2">
        <h1 className="text-kfs-dark">Apply for Leave</h1>
        <p className="text-gray-500 text-sm">Fill in Part I of the KFS Leave Form</p>
      </div>

      {/* Employee info banner */}
      <div className="card mb-5 bg-kfs-muted border-kfs-green/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { label: 'Name',          value: user?.name },
            { label: 'Personal No.',  value: user?.personal_number },
            { label: 'Designation',   value: user?.designation || '—' },
            { label: 'Department',    value: user?.department_name || '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="font-medium text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Leave Type */}
        <div className="card">
          <h3 className="section-title">Leave Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nature of Leave <span className="text-red-500">*</span>
              </label>
              <select
                className={`input-field ${errors.leave_type ? 'border-red-400' : ''}`}
                {...register('leave_type', { required: 'Please select a leave type' })}
              >
                <option value="">— Select leave type —</option>
                {leaveTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errors.leave_type && (
                <p className="text-red-500 text-xs mt-1">{errors.leave_type.message}</p>
              )}

              {/* Balance info */}
              {selectedBalance && (
                <div className="mt-2 flex items-center gap-2 text-xs
                                text-kfs-green bg-kfs-accent px-3 py-1.5 rounded-lg">
                  <Info size={13} />
                  Balance: <strong>{selectedBalance.remaining} days</strong> remaining
                  (Taken: {selectedBalance.taken} / {selectedBalance.total_entitlement})
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={minDate}
                  className={`input-field ${errors.from_date ? 'border-red-400' : ''}`}
                  {...register('from_date', { required: 'Required' })}
                />
                {errors.from_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.from_date.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={watchFrom || minDate}
                  className={`input-field ${errors.to_date ? 'border-red-400' : ''}`}
                  {...register('to_date', { required: 'Required' })}
                />
                {errors.to_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.to_date.message}</p>
                )}
              </div>
            </div>

            {/* Working days display */}
            {(loadingDays || workingDays !== null) && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200
                              rounded-lg px-3 py-2 text-sm">
                <CalendarDays size={16} className="text-blue-500 shrink-0" />
                {loadingDays ? (
                  <span className="text-blue-600">Calculating working days...</span>
                ) : (
                  <span className="text-blue-700">
                    <strong>{workingDays} working days</strong>
                    {' '}(excludes weekends & public holidays)
                  </span>
                )}
              </div>
            )}

            {/* 14-day notice info */}
            {!isSick && (
              <div className="flex items-start gap-2 text-xs text-amber-700
                              bg-amber-50 px-3 py-2 rounded-lg">
                <Info size={13} className="mt-0.5 shrink-0" />
                Leave must be applied at least 14 days in advance
                (except sick leave).
              </div>
            )}
          </div>
        </div>

        {/* Leave address & contact */}
        <div className="card">
          <h3 className="section-title">During Leave</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Where will you be during your leave?"
                className={`input-field resize-none ${errors.leave_address ? 'border-red-400' : ''}`}
                {...register('leave_address', { required: 'Leave address is required' })}
              />
              {errors.leave_address && (
                <p className="text-red-500 text-xs mt-1">{errors.leave_address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone During Leave <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="07xx xxx xxx"
                className={`input-field ${errors.phone_during_leave ? 'border-red-400' : ''}`}
                {...register('phone_during_leave', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^(\+254|0)[17]\d{8}$/,
                    message: 'Enter a valid Kenyan phone number',
                  },
                })}
              />
              {errors.phone_during_leave && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone_during_leave.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Acting officer */}
        <div className="card">
          <h3 className="section-title">Acting Officer</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who will perform your duties?
            </label>
            <select
              className="input-field"
              {...register('acting_officer')}
            >
              <option value="">— Select colleague —</option>
              {colleagues.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.designation || 'Staff'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Must be from your department. Optional but recommended.
            </p>
          </div>
        </div>

        {/* Document upload */}
        {selectedType?.requires_document && (
          <div className="card border-amber-200 bg-amber-50">
            <h3 className="section-title text-amber-800">
              Supporting Document Required
            </h3>
            <p className="text-xs text-amber-700 mb-3">
              {selectedType.name} requires a supporting document
              (medical certificate, etc.)
            </p>

            {selectedFile ? (
              <div className="flex items-center justify-between bg-white
                              border border-amber-300 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
                  <Upload size={14} className="text-kfs-green shrink-0" />
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="text-gray-400 shrink-0">
                    ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-red-400 hover:text-red-600 ml-2 shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center
                                border-2 border-dashed border-amber-300 rounded-lg
                                py-6 cursor-pointer hover:bg-amber-100 transition-colors">
                <Upload size={24} className="text-amber-500 mb-2" />
                <span className="text-sm text-amber-700 font-medium">
                  Click to upload document
                </span>
                <span className="text-xs text-amber-500 mt-1">
                  PDF, JPEG, PNG — max 5MB
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                />
              </label>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || applyLeave.isPending}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {(isSubmitting || applyLeave.isPending) && (
              <Loader2 size={16} className="animate-spin" />
            )}
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  )
}