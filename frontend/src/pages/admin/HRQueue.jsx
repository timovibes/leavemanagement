import { useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { useAllLeaves, useDepartments } from '../../hooks/useHR'
import StatusBadge from '../../components/ui/StatusBadge'

const STATUS_OPTIONS = [
  { value: '',                  label: 'All Statuses' },
  { value: 'DRAFT',             label: 'Draft' },
  { value: 'SUBMITTED',         label: 'Submitted' },
  { value: 'SUPERVISOR_REVIEW', label: 'Supervisor Review' },
  { value: 'HR_REVIEW',         label: 'HR Review' },
  { value: 'HR_CHECK',          label: 'HR Check' },
  { value: 'APPROVED',          label: 'Approved' },
  { value: 'REJECTED',          label: 'Rejected' },
]

export default function AdminHRQueue() {
  const currentYear = new Date().getFullYear()
  const [status, setStatus]         = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear]             = useState(String(currentYear))
  const [search, setSearch]         = useState('')
  const { data: leaves = [], isLoading } = useAllLeaves({ status, department, year })
  const { data: departments = [] }       = useDepartments()
  const filtered = leaves.filter(l =>
    l.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.leave_type_name?.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="page-container">
      <div className="mt-2 mb-5">
        <h1 className="text-kfs-dark">Leave Queue</h1>
        <p className="text-gray-500 text-sm">System-wide overview of all leave requests</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" placeholder="Search employee or leave type..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-40" value={status} onChange={e => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input-field w-40" value={department} onChange={e => setDepartment(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input-field w-28" value={year} onChange={e => setYear(e.target.value)}>
          {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-gray-200 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12"><FileText size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No leave requests found</p></div>
      ) : (
        <div className="space-y-3 mb-4">
          {filtered.map(leave => (
            <div key={leave.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{leave.employee_name}</p>
                  <p className="text-xs text-gray-500">{leave.leave_type_name} • {leave.days_requested} day{leave.days_requested !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{leave.from_date} → {leave.to_date}</p>
                </div>
                <StatusBadge status={leave.status} />
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 text-center pb-4">Showing {filtered.length} of {leaves.length} requests</p>
    </div>
  )
}
