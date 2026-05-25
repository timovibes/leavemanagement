#!/bin/bash

# ============================================================
# Run from inside F:\kfs-leave-system-new in Git Bash:
#   bash create_missing.sh
# ============================================================

PAGES="./frontend/src/pages"

echo "🚀 Creating missing files with real code..."

# ── 1. headhr/Employees.jsx ──────────────────────────────────
cat > "$PAGES/headhr/Employees.jsx" << 'EOF'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Users, Search, Edit2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useEmployees, useUpdateEmployee, useDepartments } from '../../hooks/useHR'

const ROLES = [
  { value: 'EMPLOYEE',   label: 'Employee' },
  { value: 'SUPERVISOR', label: 'Supervisor / HOD' },
  { value: 'HR_OFFICER', label: 'HR Officer' },
  { value: 'HEAD_HR',    label: 'Head of HR' },
]
const GRADES = ['KFS_1','KFS_2','KFS_3','KFS_4','KFS_5','KFS_6','KFS_7','KFS_8']

function EmployeeCard({ employee }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing]   = useState(false)
  const update = useUpdateEmployee()
  const { data: departments = [] } = useDepartments()
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: employee.name, designation: employee.designation,
      role: employee.role, grade: employee.grade,
      salary_band: employee.salary_band, department: employee.department,
    }
  })
  const onUpdate = async (data) => {
    await update.mutateAsync({ id: employee.id, data })
    setEditing(false)
  }
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-kfs-green flex items-center justify-center text-white font-bold text-sm shrink-0">
            {employee.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{employee.name}</p>
            <p className="text-xs text-gray-500 truncate">{employee.email}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs bg-kfs-accent text-kfs-green px-2 py-0.5 rounded-full">
                {employee.role?.replace('_', ' ')}
              </span>
              {employee.grade && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {employee.grade?.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => { setEditing(true); setExpanded(true) }} className="p-2 text-kfs-green hover:bg-kfs-accent rounded-lg">
            <Edit2 size={15} />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      {expanded && !editing && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {[
              ['Personal No.', employee.personal_number],
              ['Designation',  employee.designation || '—'],
              ['Department',   employee.department_name || '—'],
              ['Salary Band',  `KSh ${Number(employee.salary_band).toLocaleString()}/mo`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-medium text-gray-700">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {expanded && editing && (
        <form onSubmit={handleSubmit(onUpdate)} className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <input className="input-field" {...register('name', { required: true })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
              <input className="input-field" {...register('designation')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Salary Band (KSh)</label>
              <input type="number" className="input-field" {...register('salary_band')} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
              <select className="input-field" {...register('department')}>
                <option value="">— None —</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select className="input-field" {...register('role')}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Grade</label>
              <select className="input-field" {...register('grade')}>
                <option value="">— None —</option>
                {GRADES.map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary py-1.5 text-sm">Cancel</button>
            <button type="submit" disabled={update.isPending} className="btn-primary py-1.5 text-sm flex items-center gap-2">
              {update.isPending && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function HeadHREmployees() {
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const { data: employeesData, isLoading } = useEmployees({ role: roleFilter })
  const employees = employeesData?.results || employeesData || []
  const filtered  = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.personal_number?.includes(search)
  )
  return (
    <div className="page-container">
      <div className="mt-2 mb-5">
        <h1 className="text-kfs-dark">Employees</h1>
        <p className="text-gray-500 text-sm">{employees.length} staff member{employees.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" placeholder="Search by name, email, number..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-36" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-gray-200 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No employees found</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">{filtered.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}</div>
      )}
    </div>
  )
}
EOF

# ── 2. admin/Employees.jsx ───────────────────────────────────
cat > "$PAGES/admin/Employees.jsx" << 'EOF'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Users, Plus, Search, Edit2, ChevronDown, ChevronUp, Loader2, X } from 'lucide-react'
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDepartments } from '../../hooks/useHR'
import { useLeaveTypes } from '../../hooks/useLeaves'

const ROLES = [
  { value: 'EMPLOYEE',   label: 'Employee' },
  { value: 'SUPERVISOR', label: 'Supervisor / HOD' },
  { value: 'HR_OFFICER', label: 'HR Officer' },
  { value: 'HEAD_HR',    label: 'Head of HR' },
  { value: 'ADMIN',      label: 'Admin' },
]
const GRADES = ['KFS_1','KFS_2','KFS_3','KFS_4','KFS_5','KFS_6','KFS_7','KFS_8']

function CreateModal({ onClose }) {
  const create = useCreateEmployee()
  const { data: departments = [] } = useDepartments()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const onSubmit = async (data) => { await create.mutateAsync(data); onClose() }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Create Employee</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-3">
          {[
            { name: 'name',            label: 'Full Name',            type: 'text',     req: true },
            { name: 'email',           label: 'Email',                type: 'email',    req: true },
            { name: 'personal_number', label: 'Personal Number',      type: 'text',     req: true },
            { name: 'designation',     label: 'Designation',          type: 'text',     req: true },
            { name: 'salary_band',     label: 'Monthly Salary (KSh)', type: 'number',   req: true },
            { name: 'password',        label: 'Initial Password',     type: 'password', req: true },
          ].map(({ name, label, type, req }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label} {req && <span className="text-red-500">*</span>}</label>
              <input type={type} className={`input-field ${errors[name] ? 'border-red-400' : ''}`} {...register(name, req ? { required: `${label} is required` } : {})} />
              {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
            <select className={`input-field ${errors.department ? 'border-red-400' : ''}`} {...register('department', { required: 'Department is required' })}>
              <option value="">— Select department —</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
            <select className="input-field" {...register('role', { required: 'Role is required' })}>
              <option value="">— Select role —</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <select className="input-field" {...register('grade')}>
              <option value="">— Select grade —</option>
              {GRADES.map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={create.isPending} className="btn-primary flex items-center justify-center gap-2">
              {create.isPending && <Loader2 size={15} className="animate-spin" />}
              Create Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EmployeeCard({ employee }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing]   = useState(false)
  const update = useUpdateEmployee()
  const { data: departments = [] } = useDepartments()
  const { register, handleSubmit } = useForm({
    defaultValues: { name: employee.name, designation: employee.designation, role: employee.role, grade: employee.grade, salary_band: employee.salary_band, department: employee.department }
  })
  const onUpdate = async (data) => { await update.mutateAsync({ id: employee.id, data }); setEditing(false) }
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-kfs-green flex items-center justify-center text-white font-bold text-sm shrink-0">{employee.name?.charAt(0)}</div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{employee.name}</p>
            <p className="text-xs text-gray-500 truncate">{employee.email}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs bg-kfs-accent text-kfs-green px-2 py-0.5 rounded-full">{employee.role?.replace('_', ' ')}</span>
              {employee.grade && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{employee.grade?.replace('_', ' ')}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => { setEditing(true); setExpanded(true) }} className="p-2 text-kfs-green hover:bg-kfs-accent rounded-lg"><Edit2 size={15} /></button>
          <button onClick={() => setExpanded(!expanded)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
        </div>
      </div>
      {expanded && !editing && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {[['Personal No.', employee.personal_number],['Designation', employee.designation || '—'],['Department', employee.department_name || '—'],['Salary Band', `KSh ${Number(employee.salary_band).toLocaleString()}/mo`]].map(([label, value]) => (
              <div key={label}><p className="text-xs text-gray-400">{label}</p><p className="font-medium text-gray-700">{value}</p></div>
            ))}
          </div>
        </div>
      )}
      {expanded && editing && (
        <form onSubmit={handleSubmit(onUpdate)} className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label><input className="input-field" {...register('name', { required: true })} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Designation</label><input className="input-field" {...register('designation')} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Salary Band (KSh)</label><input type="number" className="input-field" {...register('salary_band')} /></div>
            <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Department</label><select className="input-field" {...register('department')}><option value="">— None —</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Role</label><select className="input-field" {...register('role')}>{ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Grade</label><select className="input-field" {...register('grade')}><option value="">— None —</option>{GRADES.map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}</select></div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary py-1.5 text-sm">Cancel</button>
            <button type="submit" disabled={update.isPending} className="btn-primary py-1.5 text-sm flex items-center gap-2">{update.isPending && <Loader2 size={14} className="animate-spin" />}Save</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function AdminEmployees() {
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const { data: employeesData, isLoading } = useEmployees({ role: roleFilter })
  const employees = employeesData?.results || employeesData || []
  const filtered  = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.personal_number?.includes(search)
  )
  return (
    <div className="page-container">
      <div className="flex items-center justify-between mt-2 mb-5">
        <div><h1 className="text-kfs-dark">Employees</h1><p className="text-gray-500 text-sm">{employees.length} staff member{employees.length !== 1 ? 's' : ''}</p></div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 btn-primary w-auto px-4 py-2 text-sm"><Plus size={16} /> Add Employee</button>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" placeholder="Search by name, email, number..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-36" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-gray-200 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12"><Users size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No employees found</p><button onClick={() => setShowCreate(true)} className="btn-primary max-w-xs mx-auto mt-4 block">Add First Employee</button></div>
      ) : (
        <div className="space-y-3 mb-8">{filtered.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}</div>
      )}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
EOF

# ── 3. admin/HRQueue.jsx ─────────────────────────────────────
cat > "$PAGES/admin/HRQueue.jsx" << 'EOF'
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
EOF

# ── 4. admin/Reports.jsx ─────────────────────────────────────
cat > "$PAGES/admin/Reports.jsx" << 'EOF'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Edit2, Loader2, X, Settings } from 'lucide-react'
import {
  useLeaveTypesAdmin, useCreateLeaveType, useUpdateLeaveType, useDeleteLeaveType,
  usePublicHolidays, useCreateHoliday, useDeleteHoliday,
  useCreateDepartment, useUpdateDepartment, useDeleteDepartment,
} from '../../hooks/useAdmin'
import { useDepartments } from '../../hooks/useHR'

const TABS = ['Leave Types', 'Departments', 'Public Holidays']

function LeaveTypesTab() {
  const { data: leaveTypes = [], isLoading } = useLeaveTypesAdmin()
  const createLeaveType = useCreateLeaveType()
  const updateLeaveType = useUpdateLeaveType()
  const deleteLeaveType = useDeleteLeaveType()
  const [editing, setEditing]       = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const { register, handleSubmit, reset } = useForm()
  const onCreate = async (data) => { await createLeaveType.mutateAsync(data); reset(); setShowCreate(false) }
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 btn-primary w-auto px-4 py-2 text-sm"><Plus size={15} /> Add Leave Type</button>
      </div>
      {showCreate && (
        <div className="card border-2 border-kfs-green/30">
          <h4 className="font-medium text-gray-700 mb-3">New Leave Type</h4>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
            <input className="input-field" placeholder="Name (e.g. Annual Leave)" {...register('name', { required: true })} />
            <input type="number" className="input-field" placeholder="Max days per year" {...register('max_days', { required: true })} />
            <textarea className="input-field" placeholder="Description (optional)" rows={2} {...register('description')} />
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" {...register('requires_document')} />Requires supporting document</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm py-1.5">Cancel</button>
              <button type="submit" disabled={createLeaveType.isPending} className="btn-primary text-sm py-1.5 flex items-center gap-2">{createLeaveType.isPending && <Loader2 size={13} className="animate-spin" />}Create</button>
            </div>
          </form>
        </div>
      )}
      {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-gray-200 animate-pulse" />)}</div> : leaveTypes.map(type => (
        <div key={type.id} className="card">
          {editing?.id === type.id ? (
            <EditLeaveTypeForm type={type} onSave={async (data) => { await updateLeaveType.mutateAsync({ id: type.id, data }); setEditing(null) }} onCancel={() => setEditing(null)} isPending={updateLeaveType.isPending} />
          ) : (
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-gray-800 text-sm">{type.name}</p><p className="text-xs text-gray-500">Max {type.max_days} days{type.requires_document ? ' • Requires document' : ''}</p></div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(type)} className="p-2 text-kfs-green hover:bg-kfs-accent rounded-lg"><Edit2 size={14} /></button>
                <button onClick={() => deleteLeaveType.mutate(type.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function EditLeaveTypeForm({ type, onSave, onCancel, isPending }) {
  const { register, handleSubmit } = useForm({ defaultValues: { name: type.name, max_days: type.max_days, description: type.description, requires_document: type.requires_document } })
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-3">
      <input className="input-field" {...register('name', { required: true })} />
      <input type="number" className="input-field" {...register('max_days', { required: true })} />
      <textarea className="input-field" rows={2} {...register('description')} />
      <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" {...register('requires_document')} />Requires supporting document</label>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm py-1.5">Cancel</button>
        <button type="submit" disabled={isPending} className="btn-primary text-sm py-1.5 flex items-center gap-2">{isPending && <Loader2 size={13} className="animate-spin" />}Save</button>
      </div>
    </form>
  )
}

function DepartmentsTab() {
  const { data: departments = [], isLoading } = useDepartments()
  const createDept = useCreateDepartment()
  const updateDept = useUpdateDepartment()
  const deleteDept = useDeleteDepartment()
  const [editing, setEditing]       = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const { register, handleSubmit, reset } = useForm()
  const onCreate = async (data) => { await createDept.mutateAsync(data); reset(); setShowCreate(false) }
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 btn-primary w-auto px-4 py-2 text-sm"><Plus size={15} /> Add Department</button>
      </div>
      {showCreate && (
        <div className="card border-2 border-kfs-green/30">
          <h4 className="font-medium text-gray-700 mb-3">New Department</h4>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
            <input className="input-field" placeholder="Department name" {...register('name', { required: true })} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm py-1.5">Cancel</button>
              <button type="submit" disabled={createDept.isPending} className="btn-primary text-sm py-1.5 flex items-center gap-2">{createDept.isPending && <Loader2 size={13} className="animate-spin" />}Create</button>
            </div>
          </form>
        </div>
      )}
      {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-gray-200 animate-pulse" />)}</div> : departments.map(dept => (
        <div key={dept.id} className="card">
          {editing?.id === dept.id ? (
            <form onSubmit={handleSubmit(async (data) => { await updateDept.mutateAsync({ id: dept.id, data }); setEditing(null) })} className="flex gap-2">
              <input className="input-field flex-1" defaultValue={dept.name} {...register('name', { required: true })} />
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary text-sm py-1.5 px-3">Cancel</button>
              <button type="submit" disabled={updateDept.isPending} className="btn-primary text-sm py-1.5 px-3">Save</button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-800 text-sm">{dept.name}</p>
              <div className="flex gap-1">
                <button onClick={() => setEditing(dept)} className="p-2 text-kfs-green hover:bg-kfs-accent rounded-lg"><Edit2 size={14} /></button>
                <button onClick={() => deleteDept.mutate(dept.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PublicHolidaysTab() {
  const { data: holidays = [], isLoading } = usePublicHolidays()
  const createHoliday = useCreateHoliday()
  const deleteHoliday = useDeleteHoliday()
  const [showCreate, setShowCreate] = useState(false)
  const { register, handleSubmit, reset } = useForm()
  const onCreate = async (data) => { await createHoliday.mutateAsync(data); reset(); setShowCreate(false) }
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 btn-primary w-auto px-4 py-2 text-sm"><Plus size={15} /> Add Holiday</button>
      </div>
      {showCreate && (
        <div className="card border-2 border-kfs-green/30">
          <h4 className="font-medium text-gray-700 mb-3">New Public Holiday</h4>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
            <input className="input-field" placeholder="Holiday name (e.g. Jamhuri Day)" {...register('name', { required: true })} />
            <input type="date" className="input-field" {...register('date', { required: true })} />
            <textarea className="input-field" placeholder="Description (optional)" rows={2} {...register('description')} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm py-1.5">Cancel</button>
              <button type="submit" disabled={createHoliday.isPending} className="btn-primary text-sm py-1.5 flex items-center gap-2">{createHoliday.isPending && <Loader2 size={13} className="animate-spin" />}Add</button>
            </div>
          </form>
        </div>
      )}
      {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-gray-200 animate-pulse" />)}</div>
      : holidays.length === 0 ? <div className="card text-center py-10"><p className="text-gray-400 text-sm">No public holidays added yet</p></div>
      : holidays.map(holiday => (
        <div key={holiday.id} className="card flex items-center justify-between">
          <div><p className="font-medium text-gray-800 text-sm">{holiday.name}</p><p className="text-xs text-gray-500">{holiday.date}</p></div>
          <button onClick={() => deleteHoliday.mutate(holiday.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  )
}

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('Leave Types')
  return (
    <div className="page-container">
      <div className="mt-2 mb-5 flex items-center gap-3">
        <Settings size={22} className="text-kfs-green" />
        <div>
          <h1 className="text-kfs-dark">System Settings</h1>
          <p className="text-gray-500 text-sm">Manage leave types, departments & holidays</p>
        </div>
      </div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-white text-kfs-green shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 'Leave Types'     && <LeaveTypesTab />}
      {activeTab === 'Departments'     && <DepartmentsTab />}
      {activeTab === 'Public Holidays' && <PublicHolidaysTab />}
    </div>
  )
}
EOF

echo ""
echo "✅ Done! 4 files created with real code:"
echo "   pages/headhr/Employees.jsx  — view + edit employees (no create)"
echo "   pages/admin/Employees.jsx   — full control incl. ADMIN role"
echo "   pages/admin/HRQueue.jsx     — system-wide leave request overview"
echo "   pages/admin/Reports.jsx     — manage leave types, departments & holidays"
