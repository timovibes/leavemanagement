import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import queryClient from './lib/queryClient'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import Unauthorized from './pages/Unauthorized'

// Auth
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'

// Employee
import Dashboard from './pages/employee/Dashboard'
import ApplyLeave from './pages/employee/ApplyLeave'
import MyLeaves from './pages/employee/MyLeaves'
import LeaveDetail from './pages/employee/LeaveDetail'
import Profile from './pages/employee/Profile'
import Notifications from './pages/employee/Notifications'


import SupervisorDashboard from './pages/supervisor/SupervisorDashboard'
import PendingApprovals from './pages/supervisor/PendingApprovals'
import TeamCalendar from './pages/supervisor/TeamCalendar'

import { useNavigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

import HRDashboard from './pages/hr/HRDashboard'
import HRQueue from './pages/hr/HRQueue'
import EmployeeManagement from './pages/hr/EmployeeManagement'


import HeadHRDashboard from './pages/headhr/HeadHRDashboard'
import FinalApprovals from './pages/headhr/FinalApprovals'
import Reports from './pages/headhr/Reports'

// Placeholders for future phases
const Placeholder = ({ title }) => (
  <div className="page-container">
    <div className="card mt-6">
      <h2 className="text-kfs-green">{title}</h2>
      <p className="text-gray-400 mt-1 text-sm">Coming soon...</p>
    </div>
  </div>
)

const ROLES = {
  ALL:     ['EMPLOYEE', 'SUPERVISOR', 'HR_OFFICER', 'HEAD_HR', 'ADMIN'],
  HR_UP:   ['HR_OFFICER', 'HEAD_HR', 'ADMIN'],
  HEAD_UP: ['HEAD_HR', 'ADMIN'],
  SUP_UP:  ['SUPERVISOR', 'HR_OFFICER', 'HEAD_HR', 'ADMIN'],
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { fontSize: '14px', maxWidth: '340px' },
            success: { iconTheme: { primary: '#2d6a4f', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* All roles */}
          <Route element={<ProtectedRoute allowedRoles={ROLES.ALL} />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard"       element={<Dashboard />} />
              <Route path="/apply-leave"     element={<ApplyLeave />} />
              <Route path="/my-leaves"       element={<MyLeaves />} />
              <Route path="/my-leaves/:id"   element={<LeaveDetail />} />
              <Route path="/notifications"   element={<Notifications />} />
              <Route path="/profile"         element={<Profile />} />
            </Route>
          </Route>

          const DashboardRedirect = () => {
  const { user } = useAuthStore()
  if (user?.role === 'SUPERVISOR') return <SupervisorDashboard />
  if (user?.role === 'HR_OFFICER') return <HRDashboard />
  if (user?.role === 'HEAD_HR')    return <HeadHRDashboard />
  return <Dashboard />
}

          {/* Supervisor+ */}
          <Route element={<ProtectedRoute allowedRoles={ROLES.SUP_UP} />}>
            <Route element={<AppShell />}>
              <Route path="/supervisor/pending"
                element={<PendingApprovals />} />
              <Route path="/supervisor/calendar"
                element={<TeamCalendar />} />
            </Route>
          </Route>

          {/* Head HR+ */}
<Route element={<ProtectedRoute allowedRoles={ROLES.HEAD_UP} />}>
  <Route element={<AppShell />}>
    <Route path="/head-hr/pending" element={<FinalApprovals />} />
    <Route path="/head-hr/reports" element={<Reports />} />
  </Route>
</Route>

          {/* Head HR+ */}
          <Route element={<ProtectedRoute allowedRoles={ROLES.HEAD_UP} />}>
            <Route element={<AppShell />}>
              <Route path="/head-hr/pending"
                element={<Placeholder title="Final Approvals" />} />
              <Route path="/head-hr/reports"
                element={<Placeholder title="Reports" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}