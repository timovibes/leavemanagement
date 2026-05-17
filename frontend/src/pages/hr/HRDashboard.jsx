import { Link } from 'react-router-dom'
import {
  FileCheck, Users, Clock, CheckCircle,
  AlertCircle, ChevronRight, TrendingUp
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { usePendingHR, useAllLeaves } from '../../hooks/useHR'
import StatusBadge from '../../components/StatusBadge'

const currentYear = new Date().getFullYear()

export default function HRDashboard() {
  const { user } = useAuthStore()
  const { data: pending = [] } = usePendingHR()
  const { data: allLeaves = [] } = useAllLeaves({ year: String(currentYear) })

  const stats = {
    hrReview:  pending.filter(l => l.status === 'HR_REVIEW').length,
    hrCheck:   pending.filter(l => l.status === 'HR_CHECK').length,
    approved:  allLeaves.filter(l => l.status === 'APPROVED').length,
    rejected:  allLeaves.filter(l => l.status === 'REJECTED').length,
  }

  return (
    <div className="page-container">
      <div className="mt-2 mb-5">
        <h1 className="text-kfs-dark">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm">HR Officer Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Needs HR Review',
            value: stats.hrReview,
            icon: Clock,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
          },
          {
            label: 'In HR Check',
            value: stats.hrCheck,
            icon: AlertCircle,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: `Approved ${currentYear}`,
            value: stats.approved,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            label: `Rejected ${currentYear}`,
            value: stats.rejected,
            icon: TrendingUp,
            color: 'text-red-500',
            bg: 'bg-red-50',
          },
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

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {[
          {
            to: '/hr/pending',
            icon: FileCheck,
            title: 'HR Queue',
            desc: `${pending.length} requests need attention`,
            color: 'text-kfs-green',
            bg: 'bg-kfs-accent',
          },
          {
            to: '/hr/employees',
            icon: Users,
            title: 'Employee Management',
            desc: 'Create, edit, manage balances',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
        ].map(({ to, icon: Icon, title, desc, color, bg }) => (
          <Link
            key={to}
            to={to}
            className={`card flex items-center gap-4 hover:shadow-md
                        transition-shadow ${bg}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center
                             justify-center ${bg} border border-white`}>
              <Icon size={24} className={color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 shrink-0" />
          </Link>
        ))}
      </div>

      {/* Pending preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">Pending HR Actions</h3>
          <Link
            to="/hr/pending"
            className="text-xs text-kfs-green font-medium
                       flex items-center gap-0.5"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="card text-center py-8">
            <CheckCircle size={32} className="mx-auto text-green-300 mb-2" />
            <p className="text-gray-400 text-sm">No pending HR actions.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.slice(0, 4).map(leave => (
              <div
                key={leave.id}
                className="card flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {leave.employee_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {leave.leave_type_name} • {leave.days_requested}d •{' '}
                    {leave.from_date}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={leave.status} />
                  <Link
                    to="/hr/pending"
                    className="btn-primary py-1.5 px-3 text-xs w-auto"
                  >
                    Process
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}