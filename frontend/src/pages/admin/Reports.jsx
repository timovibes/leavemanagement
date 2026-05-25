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
