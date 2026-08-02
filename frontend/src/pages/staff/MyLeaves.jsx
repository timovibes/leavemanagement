import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Download, Trash2, Send, ChevronRight, Filter } from 'lucide-react'
import { useMyLeaves, useLeaveTypes, useSubmitLeave, useDeleteLeave } from '../../hooks/useLeaves'
import StatusBadge from '../../components/ui/StatusBadge'
import toast from 'react-hot-toast'

const currentYear = new Date().getFullYear()
const years = [currentYear, currentYear - 1, currentYear - 2]

export default function MyLeaves() {
  const [filters, setFilters] = useState({ year: String(currentYear) })
  const [showFilters, setShowFilters] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useMyLeaves(filters)
  const { data: leaveTypes = [] } = useLeaveTypes()
  const submitLeave = useSubmitLeave()
  const deleteLeave = useDeleteLeave()

  const leaves = data?.results || data || []

  const handleSubmit = async (id) => {
    await submitLeave.mutateAsync(id)
  }

  const handleDelete = async (id) => {
    await deleteLeave.mutateAsync(id)
    setConfirmDelete(null)
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mt-2 mb-5">
        <div>
          <h1 className="text-brand-dark">My Leave History</h1>
          <p className="text-gray-500 text-sm">
            {leaves.length} application{leaves.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 text-sm text-brand
                     border border-brand rounded-lg px-3 py-2"
        >
          <Filter size={15} />
          Filter
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
              <select
                className="input-field"
                value={filters.year || ''}
                onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
              >
                <option value="">All years</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                className="input-field"
                value={filters.leave_type || ''}
                onChange={e => setFilters(f => ({ ...f, leave_type: e.target.value }))}
              >
                <option value="">All types</option>
                {leaveTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                className="input-field"
                value={filters.status || ''}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              >
                <option value="">All statuses</option>
                {['DRAFT','SUBMITTED','SUPERVISOR_REVIEW','HR_REVIEW','HR_CHECK','APPROVED','REJECTED']
                  .map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={() => setFilters({ year: String(currentYear) })}
            className="text-xs text-gray-400 hover:text-red-500 mt-3"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : leaves.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No applications found</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your filters or apply for leave.
          </p>
          <Link to="/apply-leave" className="btn-primary max-w-xs mx-auto mt-4 block">
            Apply for Leave
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map(leave => (
            <div key={leave.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">
                      {leave.leave_type_name}
                    </p>
                    <StatusBadge status={leave.status} />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {leave.from_date} → {leave.to_date}
                    <span className="ml-2 font-medium text-brand">
                      {leave.days_requested} days
                    </span>
                  </p>
                  {leave.rejection_reason && (
                    <p className="text-xs text-red-600 mt-1 bg-red-50
                                  px-2 py-1 rounded">
                      Reason: {leave.rejection_reason}
                    </p>
                  )}
                  {leave.resume_date && leave.status === 'APPROVED' && (
                    <p className="text-xs text-green-700 mt-1">
                      Resume: {leave.resume_date}
                      {leave.leave_allowance_ksh && (
                        <span className="ml-2">
                          • Allowance: KSh {Number(leave.leave_allowance_ksh).toLocaleString()}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {leave.status === 'DRAFT' && (
                    <>
                      <button
                        onClick={() => handleSubmit(leave.id)}
                        disabled={submitLeave.isPending}
                        className="p-2 text-brand hover:bg-brand-accent rounded-lg
                                   transition-colors"
                        title="Submit"
                      >
                        <Send size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(leave.id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg
                                   transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  {leave.status === 'APPROVED' && (
                    
                      <a href={`${import.meta.env.VITE_API_BASE_URL}/leaves/${leave.id}/download-pdf/`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg
                                 transition-colors"
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </a>
                  )}
                  <Link
                    to={`/my-leaves/${leave.id}`}
                    className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
                  >
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center
                        justify-center z-50 px-4 pb-6 sm:pb-0">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-sm shadow-glass">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Draft?</h3>
            <p className="text-gray-500 text-sm mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}