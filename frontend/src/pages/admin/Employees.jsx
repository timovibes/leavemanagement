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
  const totalEmployees = employeesData?.count ?? employees.length
  const filtered  = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.personal_number?.includes(search)
  )
  return (
    <div className="page-container">
      <div className="flex items-center justify-between mt-2 mb-5">
        <div><h1 className="text-kfs-dark">Employees</h1><p className="text-gray-500 text-sm">{totalEmployees} staff member{totalEmployees !== 1 ? 's' : ''}</p></div>
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
