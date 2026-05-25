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
  const filtered = employees.filter(e =>
    e.role !== 'ADMIN' && (
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.personal_number?.includes(search))
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
