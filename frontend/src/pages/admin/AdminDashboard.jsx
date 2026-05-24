// import { useState } from 'react'
// import { useForm } from 'react-hook-form'
// import {
//   Building2, BookOpen, Calendar,
//   Plus, Trash2, Edit2, X, Loader2,
//   Users, FileText, Settings
// } from 'lucide-react'
// import {
//   useDepartments, useCreateDepartment,
//   useUpdateDepartment, useDeleteDepartment,
//   useLeaveTypesAdmin, useCreateLeaveType,
//   useUpdateLeaveType, useDeleteLeaveType,
//   usePublicHolidays, useCreateHoliday,
//   useDeleteHoliday
// } from '../../hooks/useAdmin'
// import { useEmployees } from '../../hooks/useHR'
// import { useAllLeaves } from '../../hooks/useHR'
// import { useLeaveTypes } from '../../hooks/useLeaves'

// const currentYear = new Date().getFullYear()

// // ── Tab Button ───────────────────────────────
// function Tab({ active, onClick, icon: Icon, label }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm
//                   font-medium transition-colors whitespace-nowrap ${
//         active
//           ? 'bg-kfs-green text-white'
//           : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
//       }`}
//     >
//       <Icon size={15} />
//       {label}
//     </button>
//   )
// }


// // ── Departments ──────────────────────────────
// function DepartmentsTab() {
//   const { data: departments = [], isLoading } = useDepartments()
//   const { data: employeesData } = useEmployees({})
//   const employees = employeesData?.results || employeesData || []
//   const supervisors = employees.filter(e => e.role === 'SUPERVISOR')

//   const createDept = useCreateDepartment()
//   const updateDept = useUpdateDepartment()
//   const deleteDept = useDeleteDepartment()

//   const [editing, setEditing] = useState(null)
//   const [showCreate, setShowCreate] = useState(false)
//   const [confirmDelete, setConfirmDelete] = useState(null)

//   const { register, handleSubmit, reset, formState: { errors } } = useForm()
//   const {
//     register: regEdit,
//     handleSubmit: handleEdit,
//     reset: resetEdit
//   } = useForm()

//   const onCreate = async (data) => {
//     await createDept.mutateAsync(data)
//     reset()
//     setShowCreate(false)
//   }

//   const onUpdate = async (data) => {
//     await updateDept.mutateAsync({ id: editing.id, data })
//     setEditing(null)
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-500">
//           {departments.length} department{departments.length !== 1 ? 's' : ''}
//         </p>
//         <button
//           onClick={() => setShowCreate(!showCreate)}
//           className="flex items-center gap-1.5 btn-primary w-auto px-4 py-2 text-sm"
//         >
//           <Plus size={15} /> Add Department
//         </button>
//       </div>

//       {/* Create form */}
//       {showCreate && (
//         <div className="card border-kfs-green/30 bg-kfs-muted">
//           <h3 className="section-title">New Department</h3>
//           <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Department Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`input-field ${errors.name ? 'border-red-400' : ''}`}
//                 placeholder="e.g. Forest Management"
//                 {...register('name', { required: 'Name is required' })}
//               />
//               {errors.name && (
//                 <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Head of Department
//               </label>
//               <select className="input-field" {...register('head')}>
//                 <option value="">— Select Supervisor —</option>
//                 {supervisors.map(s => (
//                   <option key={s.id} value={s.id}>{s.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 type="button"
//                 onClick={() => setShowCreate(false)}
//                 className="btn-secondary"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={createDept.isPending}
//                 className="btn-primary flex items-center justify-center gap-2"
//               >
//                 {createDept.isPending && <Loader2 size={15} className="animate-spin" />}
//                 Create
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* List */}
//       {isLoading ? (
//         <div className="space-y-2">
//           {[1,2,3].map(i => (
//             <div key={i} className="h-16 rounded-xl bg-gray-200 animate-pulse" />
//           ))}
//         </div>
//       ) : departments.length === 0 ? (
//         <div className="card text-center py-10">
//           <Building2 size={32} className="mx-auto text-gray-300 mb-2" />
//           <p className="text-gray-400 text-sm">No departments yet.</p>
//         </div>
//       ) : (
//         <div className="space-y-2">
//           {departments.map(dept => (
//             <div key={dept.id} className="card">
//               {editing?.id === dept.id ? (
//                 <form
//                   onSubmit={handleEdit(onUpdate)}
//                   className="space-y-3"
//                 >
//                   <input
//                     className="input-field"
//                     defaultValue={dept.name}
//                     {...regEdit('name', { required: true })}
//                   />
//                   <select
//                     className="input-field"
//                     defaultValue={dept.head || ''}
//                     {...regEdit('head')}
//                   >
//                     <option value="">— No head —</option>
//                     {supervisors.map(s => (
//                       <option key={s.id} value={s.id}>{s.name}</option>
//                     ))}
//                   </select>
//                   <div className="flex gap-2">
//                     <button
//                       type="button"
//                       onClick={() => setEditing(null)}
//                       className="btn-secondary py-1.5 text-sm"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={updateDept.isPending}
//                       className="btn-primary py-1.5 text-sm
//                                  flex items-center justify-center gap-2"
//                     >
//                       {updateDept.isPending && (
//                         <Loader2 size={14} className="animate-spin" />
//                       )}
//                       Save
//                     </button>
//                   </div>
//                 </form>
//               ) : (
//                 <div className="flex items-center justify-between gap-2">
//                   <div>
//                     <p className="font-semibold text-gray-800">{dept.name}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">
//                       Head:{' '}
//                       {supervisors.find(s => s.id === dept.head)?.name || '— Not assigned'}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={() => { setEditing(dept); resetEdit() }}
//                       className="p-2 text-kfs-green hover:bg-kfs-accent rounded-lg"
//                     >
//                       <Edit2 size={15} />
//                     </button>
//                     <button
//                       onClick={() => setConfirmDelete(dept.id)}
//                       className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Delete confirm */}
//       {confirmDelete && (
//         <div className="fixed inset-0 bg-black/50 flex items-center
//                         justify-center z-50 px-4">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
//             <h3 className="font-semibold text-gray-800 mb-2">Delete Department?</h3>
//             <p className="text-gray-500 text-sm mb-5">
//               This cannot be undone. Employees in this department will lose
//               their department assignment.
//             </p>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setConfirmDelete(null)}
//                 className="btn-secondary"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={async () => {
//                   await deleteDept.mutateAsync(confirmDelete)
//                   setConfirmDelete(null)
//                 }}
//                 className="btn-danger"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


// // ── Leave Types ──────────────────────────────
// function LeaveTypesTab() {
//   const { data: leaveTypes = [], isLoading } = useLeaveTypesAdmin()
//   const createType = useCreateLeaveType()
//   const updateType = useUpdateLeaveType()
//   const deleteType = useDeleteLeaveType()

//   const [editing, setEditing] = useState(null)
//   const [showCreate, setShowCreate] = useState(false)
//   const [confirmDelete, setConfirmDelete] = useState(null)

//   const { register, handleSubmit, reset, formState: { errors } } = useForm()
//   const { register: regEdit, handleSubmit: handleEdit } = useForm()

//   const onCreate = async (data) => {
//     await createType.mutateAsync({
//       ...data,
//       max_days: parseInt(data.max_days),
//       requires_document: data.requires_document === 'true',
//     })
//     reset()
//     setShowCreate(false)
//   }

//   const onUpdate = async (data) => {
//     await updateType.mutateAsync({
//       id: editing.id,
//       data: {
//         ...data,
//         max_days: parseInt(data.max_days),
//         requires_document: data.requires_document === 'true',
//       }
//     })
//     setEditing(null)
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-500">
//           {leaveTypes.length} leave type{leaveTypes.length !== 1 ? 's' : ''}
//         </p>
//         <button
//           onClick={() => setShowCreate(!showCreate)}
//           className="flex items-center gap-1.5 btn-primary w-auto px-4 py-2 text-sm"
//         >
//           <Plus size={15} /> Add Leave Type
//         </button>
//       </div>

//       {/* Create form */}
//       {showCreate && (
//         <div className="card border-kfs-green/30 bg-kfs-muted">
//           <h3 className="section-title">New Leave Type</h3>
//           <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`input-field ${errors.name ? 'border-red-400' : ''}`}
//                 placeholder="e.g. Annual Leave"
//                 {...register('name', { required: 'Name is required' })}
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Max Days <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   className="input-field"
//                   placeholder="30"
//                   {...register('max_days', { required: true })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Requires Document
//                 </label>
//                 <select className="input-field" {...register('requires_document')}>
//                   <option value="false">No</option>
//                   <option value="true">Yes</option>
//                 </select>
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <textarea
//                 rows={2}
//                 className="input-field resize-none"
//                 {...register('description')}
//               />
//             </div>
//             <div className="flex gap-3">
//               <button
//                 type="button"
//                 onClick={() => setShowCreate(false)}
//                 className="btn-secondary"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={createType.isPending}
//                 className="btn-primary flex items-center justify-center gap-2"
//               >
//                 {createType.isPending && (
//                   <Loader2 size={15} className="animate-spin" />
//                 )}
//                 Create
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* List */}
//       {isLoading ? (
//         <div className="space-y-2">
//           {[1,2,3].map(i => (
//             <div key={i} className="h-16 rounded-xl bg-gray-200 animate-pulse" />
//           ))}
//         </div>
//       ) : (
//         <div className="space-y-2">
//           {leaveTypes.map(type => (
//             <div key={type.id} className="card">
//               {editing?.id === type.id ? (
//                 <form onSubmit={handleEdit(onUpdate)} className="space-y-3">
//                   <input
//                     className="input-field"
//                     defaultValue={type.name}
//                     {...regEdit('name', { required: true })}
//                   />
//                   <div className="grid grid-cols-2 gap-3">
//                     <input
//                       type="number"
//                       className="input-field"
//                       defaultValue={type.max_days}
//                       {...regEdit('max_days')}
//                     />
//                     <select
//                       className="input-field"
//                       defaultValue={String(type.requires_document)}
//                       {...regEdit('requires_document')}
//                     >
//                       <option value="false">No document</option>
//                       <option value="true">Requires document</option>
//                     </select>
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       type="button"
//                       onClick={() => setEditing(null)}
//                       className="btn-secondary py-1.5 text-sm"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={updateType.isPending}
//                       className="btn-primary py-1.5 text-sm
//                                  flex items-center justify-center gap-2"
//                     >
//                       {updateType.isPending && (
//                         <Loader2 size={14} className="animate-spin" />
//                       )}
//                       Save
//                     </button>
//                   </div>
//                 </form>
//               ) : (
//                 <div className="flex items-center justify-between gap-2">
//                   <div>
//                     <div className="flex items-center gap-2">
//                       <p className="font-semibold text-gray-800">{type.name}</p>
//                       {type.requires_document && (
//                         <span className="text-xs bg-amber-100 text-amber-700
//                                          px-2 py-0.5 rounded-full">
//                           Doc required
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-xs text-gray-500 mt-0.5">
//                       Max: {type.max_days} days
//                       {type.description && ` • ${type.description}`}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={() => setEditing(type)}
//                       className="p-2 text-kfs-green hover:bg-kfs-accent rounded-lg"
//                     >
//                       <Edit2 size={15} />
//                     </button>
//                     <button
//                       onClick={() => setConfirmDelete(type.id)}
//                       className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {confirmDelete && (
//         <div className="fixed inset-0 bg-black/50 flex items-center
//                         justify-center z-50 px-4">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
//             <h3 className="font-semibold text-gray-800 mb-2">Delete Leave Type?</h3>
//             <p className="text-gray-500 text-sm mb-5">
//               This will affect all leave balances linked to this type.
//             </p>
//             <div className="flex gap-3">
//               <button onClick={() => setConfirmDelete(null)} className="btn-secondary">
//                 Cancel
//               </button>
//               <button
//                 onClick={async () => {
//                   await deleteType.mutateAsync(confirmDelete)
//                   setConfirmDelete(null)
//                 }}
//                 className="btn-danger"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


// // ── Public Holidays ──────────────────────────
// function HolidaysTab() {
//   const { data: holidays = [], isLoading } = usePublicHolidays()
//   const createHoliday = useCreateHoliday()
//   const deleteHoliday = useDeleteHoliday()

//   const [showCreate, setShowCreate] = useState(false)
//   const [confirmDelete, setConfirmDelete] = useState(null)

//   const { register, handleSubmit, reset, formState: { errors } } = useForm()

//   const onCreate = async (data) => {
//     await createHoliday.mutateAsync(data)
//     reset()
//     setShowCreate(false)
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-500">
//           {holidays.length} holiday{holidays.length !== 1 ? 's' : ''}
//         </p>
//         <button
//           onClick={() => setShowCreate(!showCreate)}
//           className="flex items-center gap-1.5 btn-primary w-auto px-4 py-2 text-sm"
//         >
//           <Plus size={15} /> Add Holiday
//         </button>
//       </div>

//       {/* Create form */}
//       {showCreate && (
//         <div className="card border-kfs-green/30 bg-kfs-muted">
//           <h3 className="section-title">New Public Holiday</h3>
//           <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   className="input-field"
//                   placeholder="e.g. Jamhuri Day"
//                   {...register('name', { required: true })}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Date <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   className="input-field"
//                   {...register('date', { required: true })}
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <input
//                 className="input-field"
//                 placeholder="Optional"
//                 {...register('description')}
//               />
//             </div>
//             <div className="flex gap-3">
//               <button
//                 type="button"
//                 onClick={() => setShowCreate(false)}
//                 className="btn-secondary"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={createHoliday.isPending}
//                 className="btn-primary flex items-center justify-center gap-2"
//               >
//                 {createHoliday.isPending && (
//                   <Loader2 size={15} className="animate-spin" />
//                 )}
//                 Add Holiday
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* List */}
//       {isLoading ? (
//         <div className="space-y-2">
//           {[1,2,3].map(i => (
//             <div key={i} className="h-12 rounded-xl bg-gray-200 animate-pulse" />
//           ))}
//         </div>
//       ) : holidays.length === 0 ? (
//         <div className="card text-center py-10">
//           <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
//           <p className="text-gray-400 text-sm">No public holidays added yet.</p>
//         </div>
//       ) : (
//         <div className="space-y-2">
//           {holidays
//             .sort((a, b) => new Date(a.date) - new Date(b.date))
//             .map(h => (
//               <div
//                 key={h.id}
//                 className="card flex items-center justify-between gap-2"
//               >
//                 <div>
//                   <p className="font-medium text-gray-800">{h.name}</p>
//                   <p className="text-xs text-gray-500">
//                     {new Date(h.date).toLocaleDateString('en-KE', {
//                       weekday: 'long',
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric'
//                     })}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setConfirmDelete(h.id)}
//                   className="p-2 text-red-400 hover:bg-red-50 rounded-lg shrink-0"
//                 >
//                   <Trash2 size={15} />
//                 </button>
//               </div>
//             ))}
//         </div>
//       )}

//       {confirmDelete && (
//         <div className="fixed inset-0 bg-black/50 flex items-center
//                         justify-center z-50 px-4">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
//             <h3 className="font-semibold text-gray-800 mb-2">Delete Holiday?</h3>
//             <div className="flex gap-3 mt-4">
//               <button onClick={() => setConfirmDelete(null)} className="btn-secondary">
//                 Cancel
//               </button>
//               <button
//                 onClick={async () => {
//                   await deleteHoliday.mutateAsync(confirmDelete)
//                   setConfirmDelete(null)
//                 }}
//                 className="btn-danger"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


// // ── Main Admin Dashboard ─────────────────────
// export default function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState('departments')
//   const { data: employeesData } = useEmployees({})
//   const { data: leaveTypes = [] } = useLeaveTypesAdmin()
//   const { data: holidays = [] } = usePublicHolidays()
//   const { data: allData } = useAllLeaves({ year: String(currentYear) })

//   const employees = employeesData?.results || employeesData || []
//   const all = allData?.results || allData || []

//   return (
//     <div className="page-container">
//       <div className="mt-2 mb-5">
//         <h1 className="text-kfs-dark">System Administration</h1>
//         <p className="text-gray-500 text-sm">
//           Manage departments, leave types, and public holidays
//         </p>
//       </div>

//       {/* System overview */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
//         {[
//           {
//             label: 'Total Employees',
//             value: employees.length,
//             icon: Users,
//             color: 'text-kfs-green',
//             bg: 'bg-kfs-accent'
//           },
//           {
//             label: 'Leave Types',
//             value: leaveTypes.length,
//             icon: BookOpen,
//             color: 'text-blue-600',
//             bg: 'bg-blue-50'
//           },
//           {
//             label: 'Public Holidays',
//             value: holidays.length,
//             icon: Calendar,
//             color: 'text-purple-600',
//             bg: 'bg-purple-50'
//           },
//           {
//             label: `Applications ${currentYear}`,
//             value: all.length,
//             icon: FileText,
//             color: 'text-orange-600',
//             bg: 'bg-orange-50'
//           },
//         ].map(({ label, value, icon: Icon, color, bg }) => (
//           <div key={label} className={`card flex items-center gap-3 ${bg}`}>
//             <Icon size={22} className={color} />
//             <div>
//               <p className="text-xl font-bold text-gray-800">{value}</p>
//               <p className="text-xs text-gray-500">{label}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
//         <Tab
//           active={activeTab === 'departments'}
//           onClick={() => setActiveTab('departments')}
//           icon={Building2}
//           label="Departments"
//         />
//         <Tab
//           active={activeTab === 'leavetypes'}
//           onClick={() => setActiveTab('leavetypes')}
//           icon={BookOpen}
//           label="Leave Types"
//         />
//         <Tab
//           active={activeTab === 'holidays'}
//           onClick={() => setActiveTab('holidays')}
//           icon={Calendar}
//           label="Public Holidays"
//         />
//       </div>

//       {/* Tab content */}
//       {activeTab === 'departments' && <DepartmentsTab />}
//       {activeTab === 'leavetypes'  && <LeaveTypesTab />}
//       {activeTab === 'holidays'    && <HolidaysTab />}
//     </div>
//   )
// }

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Building2, BookOpen, Calendar,
  Plus, Trash2, Edit2, X, Loader2,
  Users, FileText, CheckCircle,
  XCircle, Clock, TrendingUp
} from 'lucide-react'
import {
  useDepartments, useCreateDepartment,
  useUpdateDepartment, useDeleteDepartment,
  useLeaveTypesAdmin, useCreateLeaveType,
  useUpdateLeaveType, useDeleteLeaveType,
  usePublicHolidays, useCreateHoliday,
  useDeleteHoliday
} from '../../hooks/useAdmin'
import { useEmployees, useAllLeaves } from '../../hooks/useHR'
import { useLeaveTypes } from '../../hooks/useLeaves'
import useAuthStore from '../../store/authStore'

const currentYear = new Date().getFullYear()

function Tab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm
                  font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-kfs-green text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  )
}


// ── Departments ──────────────────────────────
function DepartmentsTab() {
  const { data: departments = [], isLoading } = useDepartments()
  const { data: employeesData } = useEmployees({})
  const employees = employeesData?.results || employeesData || []
  const supervisors = employees.filter(e => e.role === 'SUPERVISOR')

  const createDept = useCreateDepartment()
  const updateDept = useUpdateDepartment()
  const deleteDept = useDeleteDepartment()

  const [editing, setEditing] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { register: regEdit, handleSubmit: handleEdit, reset: resetEdit } = useForm()

  const onCreate = async (data) => {
    await createDept.mutateAsync(data)
    reset()
    setShowCreate(false)
  }

  const onUpdate = async (data) => {
    await updateDept.mutateAsync({ id: editing.id, data })
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {departments.length} department{departments.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 btn-primary w-auto px-4 py-2 text-sm"
        >
          <Plus size={15} /> Add Department
        </button>
      </div>

      {showCreate && (
        <div className="card border-kfs-green/30 bg-kfs-muted">
          <h3 className="section-title">New Department</h3>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                placeholder="e.g. Forest Management"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Head of Department
              </label>
              <select className="input-field" {...register('head')}>
                <option value="">— Select Supervisor —</option>
                {supervisors.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={createDept.isPending}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {createDept.isPending && <Loader2 size={15} className="animate-spin" />}
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="card text-center py-10">
          <Building2 size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-400 text-sm">No departments yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {departments.map(dept => (
            <div key={dept.id} className="card">
              {editing?.id === dept.id ? (
                <form onSubmit={handleEdit(onUpdate)} className="space-y-3">
                  <input
                    className="input-field"
                    defaultValue={dept.name}
                    {...regEdit('name', { required: true })}
                  />
                  <select
                    className="input-field"
                    defaultValue={dept.head || ''}
                    {...regEdit('head')}
                  >
                    <option value="">— No head —</option>
                    {supervisors.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="btn-secondary py-1.5 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateDept.isPending}
                      className="btn-primary py-1.5 text-sm flex items-center justify-center gap-2"
                    >
                      {updateDept.isPending && <Loader2 size={14} className="animate-spin" />}
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{dept.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Head:{' '}
                      {supervisors.find(s => s.id === dept.head)?.name || '— Not assigned'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditing(dept); resetEdit() }}
                      className="p-2 text-kfs-green hover:bg-kfs-accent rounded-lg"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(dept.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Department?</h3>
            <p className="text-gray-500 text-sm mb-5">
              This cannot be undone. Employees will lose their department assignment.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={async () => { await deleteDept.mutateAsync(confirmDelete); setConfirmDelete(null) }}
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


// ── Leave Types ──────────────────────────────
function LeaveTypesTab() {
  const { data: leaveTypes = [], isLoading } = useLeaveTypesAdmin()
  const createType = useCreateLeaveType()
  const updateType = useUpdateLeaveType()
  const deleteType = useDeleteLeaveType()

  const [editing, setEditing] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { register: regEdit, handleSubmit: handleEdit } = useForm()

  const onCreate = async (data) => {
    await createType.mutateAsync({
      ...data,
      max_days: parseInt(data.max_days),
      requires_document: data.requires_document === 'true',
    })
    reset()
    setShowCreate(false)
  }

  const onUpdate = async (data) => {
    await updateType.mutateAsync({
      id: editing.id,
      data: {
        ...data,
        max_days: parseInt(data.max_days),
        requires_document: data.requires_document === 'true',
      }
    })
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {leaveTypes.length} leave type{leaveTypes.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 btn-primary w-auto px-4 py-2 text-sm"
        >
          <Plus size={15} /> Add Leave Type
        </button>
      </div>

      {showCreate && (
        <div className="card border-kfs-green/30 bg-kfs-muted">
          <h3 className="section-title">New Leave Type</h3>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                placeholder="e.g. Annual Leave"
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="30"
                  {...register('max_days', { required: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requires Document
                </label>
                <select className="input-field" {...register('requires_document')}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea rows={2} className="input-field resize-none" {...register('description')} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={createType.isPending}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {createType.isPending && <Loader2 size={15} className="animate-spin" />}
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {leaveTypes.map(type => (
            <div key={type.id} className="card">
              {editing?.id === type.id ? (
                <form onSubmit={handleEdit(onUpdate)} className="space-y-3">
                  <input
                    className="input-field"
                    defaultValue={type.name}
                    {...regEdit('name', { required: true })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      className="input-field"
                      defaultValue={type.max_days}
                      {...regEdit('max_days')}
                    />
                    <select
                      className="input-field"
                      defaultValue={String(type.requires_document)}
                      {...regEdit('requires_document')}
                    >
                      <option value="false">No document</option>
                      <option value="true">Requires document</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditing(null)} className="btn-secondary py-1.5 text-sm">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateType.isPending}
                      className="btn-primary py-1.5 text-sm flex items-center justify-center gap-2"
                    >
                      {updateType.isPending && <Loader2 size={14} className="animate-spin" />}
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">{type.name}</p>
                      {type.requires_document && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Doc required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Max: {type.max_days} days
                      {type.description && ` • ${type.description}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing(type)} className="p-2 text-kfs-green hover:bg-kfs-accent rounded-lg">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setConfirmDelete(type.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Leave Type?</h3>
            <p className="text-gray-500 text-sm mb-5">This will affect all leave balances linked to this type.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={async () => { await deleteType.mutateAsync(confirmDelete); setConfirmDelete(null) }}
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


// ── Public Holidays ──────────────────────────
function HolidaysTab() {
  const { data: holidays = [], isLoading } = usePublicHolidays()
  const createHoliday = useCreateHoliday()
  const deleteHoliday = useDeleteHoliday()

  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { register, handleSubmit, reset } = useForm()

  const onCreate = async (data) => {
    await createHoliday.mutateAsync(data)
    reset()
    setShowCreate(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {holidays.length} holiday{holidays.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 btn-primary w-auto px-4 py-2 text-sm"
        >
          <Plus size={15} /> Add Holiday
        </button>
      </div>

      {showCreate && (
        <div className="card border-kfs-green/30 bg-kfs-muted">
          <h3 className="section-title">New Public Holiday</h3>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Jamhuri Day"
                  {...register('name', { required: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input type="date" className="input-field" {...register('date', { required: true })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input className="input-field" placeholder="Optional" {...register('description')} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={createHoliday.isPending}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {createHoliday.isPending && <Loader2 size={15} className="animate-spin" />}
                Add Holiday
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-gray-200 animate-pulse" />)}
        </div>
      ) : holidays.length === 0 ? (
        <div className="card text-center py-10">
          <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-400 text-sm">No public holidays added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {holidays
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(h => (
              <div key={h.id} className="card flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-800">{h.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(h.date).toLocaleDateString('en-KE', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(h.id)}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Holiday?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={async () => { await deleteHoliday.mutateAsync(confirmDelete); setConfirmDelete(null) }}
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


// ── Main ─────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('departments')

  const { data: employeesData } = useEmployees({})
  const { data: leaveTypesData } = useLeaveTypesAdmin()
  const { data: holidaysData }   = usePublicHolidays()
  const { data: allData }        = useAllLeaves({ year: String(currentYear) })

  const employees  = employeesData?.results  || employeesData  || []
  const leaveTypes = leaveTypesData?.results || leaveTypesData || []
  const holidays   = holidaysData?.results   || holidaysData   || []
  const all        = allData?.results        || allData        || []

  const stats = {
    approved:       all.filter(l => l.status === 'APPROVED').length,
    pending:        all.filter(l => !['APPROVED','REJECTED','DRAFT'].includes(l.status)).length,
    rejected:       all.filter(l => l.status === 'REJECTED').length,
    totalDays:      all.filter(l => l.status === 'APPROVED').reduce((s, l) => s + l.days_requested, 0),
    totalAllowance: all.filter(l => l.status === 'APPROVED').reduce((s, l) => s + parseFloat(l.leave_allowance_ksh || 0), 0),
  }

  return (
    <div className="page-container">
      {/* Welcome */}
      <div className="mt-2 mb-6">
        <h1 className="text-kfs-dark">Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm">
          System Administrator —{' '}
          {new Date().toLocaleDateString('en-KE', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* System overview */}
      <h3 className="section-title">System Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Employees', value: employees.length,  icon: Users,     color: 'text-kfs-green',  bg: 'bg-kfs-accent' },
          { label: 'Leave Types',     value: leaveTypes.length, icon: BookOpen,  color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Public Holidays', value: holidays.length,   icon: Calendar,  color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: `Applications ${currentYear}`, value: all.length, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`card flex items-center gap-3 ${bg}`}>
            <Icon size={22} className={color} />
            <div>
              <p className="text-xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Leave stats */}
      <h3 className="section-title">Leave Statistics — {currentYear}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Approved',      value: stats.approved,  icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Pending',       value: stats.pending,   icon: Clock,       color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Rejected',      value: stats.rejected,  icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50' },
          { label: 'Days Approved', value: stats.totalDays, icon: TrendingUp,  color: 'text-blue-600',   bg: 'bg-blue-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`card flex items-center gap-3 ${bg}`}>
            <Icon size={22} className={color} />
            <div>
              <p className="text-xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total allowance */}
      <div className="card mb-6 bg-kfs-dark">
        <p className="text-green-300 text-xs mb-1">Total Leave Allowance Paid — {currentYear}</p>
        <p className="text-white text-3xl font-bold">
          KSh {stats.totalAllowance.toLocaleString()}
        </p>
      </div>

      {/* Staff by role */}
      <h3 className="section-title">Staff by Role</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { role: 'EMPLOYEE',   label: 'Employees' },
          { role: 'SUPERVISOR', label: 'Supervisors' },
          { role: 'HR_OFFICER', label: 'HR Officers' },
          { role: 'HEAD_HR',    label: 'Head HR' },
        ].map(({ role, label }) => (
          <div key={role} className="card text-center">
            <p className="text-2xl font-bold text-kfs-green">
              {employees.filter(e => e.role === role).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Staff by department */}
      <h3 className="section-title">Staff by Department</h3>
      <div className="space-y-2 mb-6">
        {Array.from(new Set(employees.map(e => e.department_name).filter(Boolean)))
          .map(dept => {
            const count = employees.filter(e => e.department_name === dept).length
            const pct   = Math.round((count / (employees.length || 1)) * 100)
            return (
              <div key={dept} className="card">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-800">{dept}</p>
                  <p className="text-sm text-kfs-green font-bold">{count} staff</p>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-kfs-green rounded-full h-1.5 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
      </div>

      {/* Management tabs */}
      <h3 className="section-title">System Management</h3>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <Tab active={activeTab === 'departments'} onClick={() => setActiveTab('departments')} icon={Building2} label="Departments" />
        <Tab active={activeTab === 'leavetypes'}  onClick={() => setActiveTab('leavetypes')}  icon={BookOpen}  label="Leave Types" />
        <Tab active={activeTab === 'holidays'}    onClick={() => setActiveTab('holidays')}    icon={Calendar}  label="Public Holidays" />
      </div>

      {activeTab === 'departments' && <DepartmentsTab />}
      {activeTab === 'leavetypes'  && <LeaveTypesTab />}
      {activeTab === 'holidays'    && <HolidaysTab />}
    </div>
  )
}