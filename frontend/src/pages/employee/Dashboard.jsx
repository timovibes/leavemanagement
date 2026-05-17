import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Clock, CheckCircle, XCircle,
  TrendingUp, Plus, ChevronRight
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useLeaveBalances, useMyLeaves } from '../../hooks/useLeaves'
import { useUnreadCount } from '../../hooks/useNotifications'
import StatusBadge from '../../components/StatusBadge'

const currentYear = new Date().getFullYear()

const balanceColors = [
  'from-kfs-green to-kfs-light',
  'from-blue-500 to-blue-400',
  'from-purple-600 to-purple-400',
  'from-orange-500 to-orange-400',
  'from-pink-500 to-pink-400',
  'from-teal-600 to-teal-400',
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const { data: balancesRaw, isLoading: balLoading } = useLeaveBalances(currentYear)
  const balances = Array.isArray(balancesRaw) ? balancesRaw : (balancesRaw?.results || [])
  const { data: myLeavesData, isLoading: leavesLoading } = useMyLeaves({})
  const { data: unread = 0 } = useUnreadCount()

  const leaves = myLeavesData?.results || myLeavesData || []
  const recent = leaves.slice(0, 5)

  const stats = {
    total:    leaves.length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    pending:  leaves.filter(l => ['SUBMITTED','SUPERVISOR_REVIEW','HR_REVIEW','HR_CHECK'].includes(l.status)).length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  }

  return (
    <div className="page-container">
      {/* Welcome */}
      <div className="mb-6 mt-2">
        <h1 className="text-kfs-dark">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date().toLocaleDateString('en-KE', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',    value: stats.total,    icon: FileText,     color: 'text-gray-600' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle,  color: 'text-green-600' },
          { label: 'Pending',  value: stats.pending,  icon: Clock,        color: 'text-yellow-600' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle,      color: 'text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <Icon size={22} className={color} />
            <div>
              <p className="text-xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Leave balances */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">Leave Balances — {currentYear}</h3>
          <span className="text-xs text-gray-400">{balances.length} types</span>
        </div>

        {balLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : balances.length === 0 ? (
          <div className="card text-center py-8">
            <TrendingUp size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400 text-sm">
              No leave balances set up yet. Contact HR.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {balances.map((bal, i) => (
              <div
                key={bal.id}
                className={`bg-gradient-to-br ${balanceColors[i % balanceColors.length]}
                            rounded-xl p-4 text-white`}
              >
                <p className="text-sm font-medium opacity-90 mb-2">
                  {bal.leave_type_name}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{bal.remaining}</p>
                    <p className="text-xs opacity-75">days remaining</p>
                  </div>
                  <div className="text-right text-xs opacity-75">
                    <p>Taken: {bal.taken}</p>
                    <p>Total: {bal.total_entitlement}</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 bg-white/30 rounded-full h-1.5">
                  <div
                    className="bg-white rounded-full h-1.5 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (bal.taken / (bal.total_entitlement || 1)) * 100
                      )}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent requests */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">Recent Applications</h3>
          <Link
            to="/my-leaves"
            className="text-xs text-kfs-green font-medium flex items-center gap-0.5"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {leavesLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="card text-center py-8">
            <FileText size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400 text-sm">No applications yet.</p>
            <Link to="/apply-leave" className="btn-primary mt-4 max-w-xs mx-auto block">
              Apply for Leave
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map(leave => (
              <Link
                key={leave.id}
                to={`/my-leaves/${leave.id}`}
                className="card flex items-center justify-between hover:border-kfs-green
                           transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {leave.leave_type_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {leave.from_date} → {leave.to_date}
                    <span className="ml-2 font-medium">({leave.days_requested}d)</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <StatusBadge status={leave.status} />
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FAB — Apply Leave */}
      <Link
        to="/apply-leave"
        className="fixed bottom-6 right-6 bg-kfs-green text-white
                   rounded-full shadow-lg p-4 flex items-center gap-2
                   hover:bg-kfs-dark transition-colors z-10
                   md:hidden"
      >
        <Plus size={22} />
      </Link>

      {/* Desktop apply button */}
      <div className="hidden md:block">
        <Link to="/apply-leave" className="btn-primary max-w-xs">
          + Apply for Leave
        </Link>
      </div>
    </div>
  )
}