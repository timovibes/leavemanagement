import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import queryClient from './services/queryClient'
import ProtectedRoute from './components/ui/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import useAuthStore from './store/authStore'

// Auth
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import Unauthorized from './pages/Unauthorized'

// Staff
import StaffDashboard from './pages/staff/Dashboard'
import ApplyLeave from './pages/staff/ApplyLeave'
import MyLeaves from './pages/staff/MyLeaves'
import LeaveDetail from './pages/staff/LeaveDetail'
import Profile from './pages/staff/Profile'
import Notifications from './pages/staff/Notifications'

// Supervisor
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard'
import PendingApprovals from './pages/supervisor/PendingApprovals'
import TeamCalendar from './pages/supervisor/TeamCalendar'

// HR
import HRDashboard from './pages/hr/HRDashboard'
import HRQueue from './pages/hr/HRQueue'
import HREmployees from './pages/hr/EmployeeManagement'

// Head HR
import HeadHRDashboard from './pages/headhr/HeadHRDashboard'
import FinalApprovals from './pages/headhr/FinalApprovals'
import HeadHRReports from './pages/headhr/Reports'
import HeadHREmployees from './pages/headhr/Employees'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEmployees from './pages/admin/Employees'
import AdminHRQueue from './pages/admin/HRQueue'
import AdminReports from './pages/admin/Reports'

const ROLES = {
  ALL:     ['EMPLOYEE', 'SUPERVISOR', 'HR_OFFICER', 'HEAD_HR', 'ADMIN'],
  HR_UP:   ['HR_OFFICER', 'HEAD_HR', 'ADMIN'],
  HEAD_UP: ['HEAD_HR', 'ADMIN'],
  SUP_UP:  ['SUPERVISOR', 'HR_OFFICER', 'HEAD_HR', 'ADMIN'],
  ADMIN:   ['ADMIN'],
}

const DashboardRedirect = () => {
  const { user } = useAuthStore()
  if (user?.role === 'SUPERVISOR') return <SupervisorDashboard />
  if (user?.role === 'HR_OFFICER') return <HRDashboard />
  if (user?.role === 'HEAD_HR')    return <HeadHRDashboard />
  if (user?.role === 'ADMIN')      return <AdminDashboard />
  return <StaffDashboard />
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
          <Route path="/login"            element={<Login />} />
          <Route path="/forgot-password"  element={<ForgotPassword />} />
          <Route path="/unauthorized"     element={<Unauthorized />} />
          <Route path="/"                 element={<Navigate to="/dashboard" replace />} />

          {/* All roles */}
          <Route element={<ProtectedRoute allowedRoles={ROLES.ALL} />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard"      element={<DashboardRedirect />} />
              <Route path="/apply-leave"    element={<ApplyLeave />} />
              <Route path="/my-leaves"      element={<MyLeaves />} />
              <Route path="/my-leaves/:id"  element={<LeaveDetail />} />
              <Route path="/notifications"  element={<Notifications />} />
              <Route path="/profile"        element={<Profile />} />
            </Route>
          </Route>

          {/* Supervisor and above */}
          <Route element={<ProtectedRoute allowedRoles={ROLES.SUP_UP} />}>
            <Route element={<AppShell />}>
              <Route path="/supervisor/pending"   element={<PendingApprovals />} />
              <Route path="/supervisor/calendar"  element={<TeamCalendar />} />
            </Route>
          </Route>

          {/* HR and above */}
          <Route element={<ProtectedRoute allowedRoles={ROLES.HR_UP} />}>
            <Route element={<AppShell />}>
              <Route path="/hr/pending"    element={<HRQueue />} />
              <Route path="/hr/employees"  element={<HREmployees />} />
            </Route>
          </Route>

          {/* Head HR and above */}
          <Route element={<ProtectedRoute allowedRoles={ROLES.HEAD_UP} />}>
            <Route element={<AppShell />}>
              <Route path="/head-hr/pending"    element={<FinalApprovals />} />
              <Route path="/head-hr/reports"    element={<HeadHRReports />} />
              <Route path="/head-hr/employees"  element={<HeadHREmployees />} />
            </Route>
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={ROLES.ADMIN} />}>
            <Route element={<AppShell />}>
              <Route path="/admin/employees"  element={<AdminEmployees />} />
              <Route path="/admin/queue"      element={<AdminHRQueue />} />
              <Route path="/admin/settings"   element={<AdminReports />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}