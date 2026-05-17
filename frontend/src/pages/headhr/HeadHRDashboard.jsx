import { Link } from 'react-router-dom'
import {
  Shield, BarChart2, CheckCircle,
  Clock, FileText, ChevronRight
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { usePendingHeadHR } from '../../hooks/useHeadHR'
import { useAllLeaves } from '../../hooks/useHR'
import StatusBadge from '../../components/StatusBadge'

const currentYear = new Date().getFullYear()

export default function HeadHRDashboard() {
  const { user } = useAuthStore()
  const { data: pending = [] } = usePendingHeadHR()
  const { data: allData } = useAllLeaves({ year: String(currentYear) })
  const all = allData?.results || allData || []

  const stats = {
    pending:  pending.length,
    approved: all.filter(l => l.status === 'APPROVED').length,
    total:    all.length,
    totalDays: all
      .filter(l => l.status === 'APPROVED')
      .reduce((s, l) => s + l.days_requested, 0),
  }

  return (
    <div className="page-container">
      <div className="mt-2 mb-5">
        <h1 className="text-kfs-dark">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm">Head of Human Resource</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Awaiting Decision',
            value: stats.pending,
            icon: Clock,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            to: '/head-hr/pending',
          },
          {
            label: `Approved ${currentYear}`,
            value: stats.approved,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50',
            to: '/head-hr/reports',
          },
          {
            label: 'Total Applications',
            value: stats.total,
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            to: '/head-hr/reports',
          },
          {
            label: 'Days Approved',
            value: stats.totalDays,
            icon: BarChart2,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            to: '/head-hr/reports',
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

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {[
          {
            to: '/head-hr/pending',
            icon: Shield,
            title: 'Final Approvals',
            desc: `${pending.length} requests need your decision`,
            color: 'text-kfs-green',
            bg: 'bg-kfs-accent',
          },
          {
            to: '/head-hr/reports',
            icon: BarChart2,
            title: 'Reports & Analytics',
            desc: 'Leave trends, department breakdown, CSV export',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">Pending Final Decisions</h3>
          <Link
            to="/head-hr/pending"
            className="text-xs text-kfs-green font-medium
                       flex items-center gap-0.5"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="card text-center py-8">
            <CheckCircle
              size={32}
              className="mx-auto text-green-300 mb-2"
            />
            <p className="text-gray-400 text-sm">
              No pending decisions.
            </p>
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
                    to="/head-hr/pending"
                    className="btn-primary py-1.5 px-3 text-xs w-auto"
                  >
                    Decide
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