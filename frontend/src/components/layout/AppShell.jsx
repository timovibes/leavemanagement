import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, History, Bell,
  Users, CheckSquare, Calendar, FileCheck,
  BarChart2, LogOut, Menu, X
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../services/axios'
import toast from 'react-hot-toast'
import { useUnreadCount } from '../../hooks/useNotifications'

const navByRole = {
  EMPLOYEE: [
    { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/apply-leave',  label: 'Apply Leave',  icon: FileText },
    { to: '/my-leaves',    label: 'My Leaves',    icon: History },
  ],
  SUPERVISOR: [
    { to: '/dashboard',           label: 'Dashboard',     icon: LayoutDashboard },
    { to: '/supervisor/pending',  label: 'Approvals',     icon: CheckSquare },
    { to: '/supervisor/calendar', label: 'Team Calendar', icon: Calendar },
  ],
  HR_OFFICER: [
    { to: '/dashboard',    label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hr/pending',   label: 'HR Queue',  icon: FileCheck },
    { to: '/hr/employees', label: 'Employees', icon: Users },
  ],
  HEAD_HR: [
    { to: '/dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
    { to: '/head-hr/pending', label: 'Final Approvals', icon: CheckSquare },
    { to: '/head-hr/reports', label: 'Reports',         icon: BarChart2 },
    { to: '/hr/employees',    label: 'Employees',       icon: Users },
  ],
  ADMIN: [
    { to: '/dashboard',       label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hr/employees',    label: 'Employees',  icon: Users },
    { to: '/hr/pending',      label: 'HR Queue',   icon: FileCheck },
    { to: '/head-hr/reports', label: 'Reports',    icon: BarChart2 },
  ],
}

export default function AppShell() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: unread = 0 } = useUnreadCount()
  const navItems = navByRole[user?.role] || navByRole.EMPLOYEE

  const handleLogout = async () => {
    try {
      const refresh = sessionStorage.getItem('refresh_token')
      await api.post('/auth/logout/', { refresh })
    } catch (_) {}
    logout()
    navigate('/login')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-kfs-dark">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-kfs-light rounded-lg flex items-center
                          justify-center text-white font-bold text-sm">KFS</div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">
              Kenya Forest Service
            </p>
            <p className="text-green-300 text-xs">Leave Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
               transition-colors duration-150 ${
                isActive
                  ? 'bg-kfs-light text-white font-medium'
                  : 'text-green-100 hover:bg-kfs-dark'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-kfs-dark p-4">
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-green-300 text-xs truncate">{user?.email}</p>
              <span className="mt-1 inline-block bg-kfs-dark text-green-300
                               text-xs px-2 py-0.5 rounded-full">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <NavLink to="/notifications" className="relative shrink-0 ml-2">
              <Bell size={20} className="text-green-300 hover:text-white transition-colors" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white
                                 text-xs w-4 h-4 rounded-full flex items-center
                                 justify-center">
                  {unread}
                </span>
              )}
            </NavLink>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-green-300 hover:text-white
                     text-sm transition-colors w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="hidden md:flex flex-col w-60 bg-kfs-green
                        fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-72 bg-kfs-green z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X size={20} />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col md:ml-60">
        <header className="md:hidden bg-kfs-green text-white px-4 py-3
                           flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <span className="font-semibold text-sm">KFS Leave System</span>
          <NavLink to="/notifications" className="relative">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white
                               text-xs w-4 h-4 rounded-full flex items-center
                               justify-center">
                {unread}
              </span>
            )}
          </NavLink>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}