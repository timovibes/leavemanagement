import { Link } from 'react-router-dom'
import { CheckSquare, Calendar, Clock, Users, ChevronRight } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { usePendingSupervisor, useTeamLeaves } from '../../hooks/useSupervisor'
import StatusBadge from '../../components/StatusBadge'

export default function SupervisorDashboard() {
  const { user } = useAuthStore()
  const { data: pending = [] } = usePendingSupervisor()
  const { data: teamLeaves = [] } = useTeamLeaves()

  const approvedLeaves = teamLeaves.filter(l => l.status === 'APPROVED')
  const onLeaveToday = approvedLeaves.filter(l => {
    const today = new Date()
    return (
      new Date(l.from_date) <= today &&
      new Date(l.to_date) >= today
    )
  })

  return (
    <div className="page-container">
      <div className="mt-2 mb-5">
        <h1 className="text-kfs-dark">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm">Supervisor Dashboard</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Pending Review',
            value: pending.length,
            icon: Clock,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            to: '/supervisor/pending'
          },
          {
            label: 'On Leave Today',
            value: onLeaveToday.length,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            to: '/supervisor/calendar'
          },
          {
            label: 'Total Team Leaves',
            value: teamLeaves.length,
            icon: CheckSquare,
            color: 'text-kfs-green',
            bg: 'bg-kfs-accent',
            to: '/supervisor/calendar'
          },
          {
            label: 'Approved This Year',
            value: approvedLeaves.length,
            icon: Calendar,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            to: '/supervisor/calendar'
          },
        ].map(({ label, value, icon: Icon, color, bg, to }) => (
          <Link key={label} to={to} className={`card flex items-center gap-3 ${bg}`}>
            <Icon size={22} className={color} />
            <div>
              <p className="text-xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending queue preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">Pending Approvals</h3>
          <Link
            to="/supervisor/pending"
            className="text-xs text-kfs-green font-medium flex items-center gap-0.5"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="card text-center py-8">
            <CheckSquare size={32} className="mx-auto text-green-300 mb-2" />
            <p className="text-gray-400 text-sm">No pending requests.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.slice(0, 3).map(leave => (
              <div key={leave.id} className="card flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {leave.employee_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {leave.leave_type_name} • {leave.days_requested}d •{' '}
                    {leave.from_date}
                  </p>
                </div>
                <Link
                  to="/supervisor/pending"
                  className="btn-primary py-1.5 px-3 text-xs w-auto shrink-0"
                >
                  Review
                </Link>
              </div>
            ))}
            {pending.length > 3 && (
              <Link
                to="/supervisor/pending"
                className="block text-center text-xs text-kfs-green font-medium py-2"
              >
                +{pending.length - 3} more pending
              </Link>
            )}
          </div>
        )}
      </div>

      {/* On leave today */}
      {onLeaveToday.length > 0 && (
        <div className="mb-6">
          <h3 className="section-title">On Leave Today</h3>
          <div className="space-y-2">
            {onLeaveToday.map(leave => (
              <div key={leave.id} className="card flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-kfs-green flex items-center
                                justify-center text-white text-sm font-bold shrink-0">
                  {leave.employee_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">
                    {leave.employee_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {leave.leave_type_name} • Returns {leave.resume_date || leave.to_date}
                  </p>
                </div>
                <StatusBadge status={leave.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}