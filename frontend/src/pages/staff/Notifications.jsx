import { Bell, CheckCheck } from 'lucide-react'
import { useNotifications, useMarkAllRead } from '../../hooks/useNotifications'

export default function Notifications() {
  const { data: notifications = [], isLoading } = useNotifications()
  const markAll = useMarkAllRead()

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mt-2 mb-5">
        <h1 className="text-brand-dark">Notifications</h1>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={() => markAll.mutate()}
            className="flex items-center gap-1.5 text-xs text-brand
                       border border-brand rounded-lg px-3 py-1.5"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">
            You'll be notified at every step of your leave application.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`card transition-colors ${
                !n.is_read ? 'border-brand/30 bg-brand-muted' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                  !n.is_read ? 'bg-brand' : 'bg-gray-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.is_read ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString('en-KE')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}