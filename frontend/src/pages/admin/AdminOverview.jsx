import { useEmployees, useAllLeaves } from '../../hooks/useHR'
import { useLeaveTypes } from '../../hooks/useLeaves'
import { usePublicHolidays } from '../../hooks/useAdmin'
import { Users, BookOpen, Calendar, FileText, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const currentYear = new Date().getFullYear()

export default function AdminOverview() {
  const { user } = useAuthStore()
  const { data: employeesData } = useEmployees({})
  const { data: leaveTypes = [] } = useLeaveTypes()
  const { data: holidaysData } = usePublicHolidays()
  const { data: allData } = useAllLeaves({ year: String(currentYear) })

  const employees = employeesData?.results || employeesData || []
  const holidays  = holidaysData?.results  || holidaysData  || []
  const all       = allData?.results       || allData       || []

  const stats = {
    employees:      employees.length,
    leaveTypes:     leaveTypes.length,
    holidays:       holidays.length,
    total:          all.length,
    approved:       all.filter(l => l.status === 'APPROVED').length,
    pending:        all.filter(l => !['APPROVED','REJECTED','DRAFT'].includes(l.status)).length,
    rejected:       all.filter(l => l.status === 'REJECTED').length,
    totalDays:      all.filter(l => l.status === 'APPROVED')
                       .reduce((s, l) => s + l.days_requested, 0),
    totalAllowance: all.filter(l => l.status === 'APPROVED')
                       .reduce((s, l) => s + parseFloat(l.leave_allowance_ksh || 0), 0),
  }

  return (
    <div className="page-container">
      {/* Welcome */}
      <div className="mt-2 mb-6">
        <h1 className="text-kfs-dark">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm">
          System Administrator —{' '}
          {new Date().toLocaleDateString('en-KE', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* System overview */}
      <h3 className="section-title">System Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Employees', value: stats.employees,  icon: Users,     color: 'text-kfs-green',  bg: 'bg-kfs-accent' },
          { label: 'Leave Types',     value: stats.leaveTypes, icon: BookOpen,  color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Public Holidays', value: stats.holidays,   icon: Calendar,  color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: `Applications ${currentYear}`, value: stats.total, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
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

      {/* Leave statistics */}
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
        <p className="text-green-300 text-xs mb-1">
          Total Leave Allowance Paid — {currentYear}
        </p>
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

      {/* Departments breakdown */}
      <h3 className="section-title">Staff by Department</h3>
      <div className="space-y-2 mb-8">
        {Array.from(new Set(employees.map(e => e.department_name).filter(Boolean)))
          .map(dept => {
            const count = employees.filter(e => e.department_name === dept).length
            const pct   = Math.round((count / stats.employees) * 100)
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
    </div>
  )
}