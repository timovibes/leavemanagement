import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import queryClient from './services/queryClient'
import ProtectedRoute from './components/ui/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import Unauthorized from './pages/Unauthorized'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import Dashboard from './pages/staff/Dashboard'
import ApplyLeave from './pages/staff/ApplyLeave'
import MyLeaves from './pages/staff/MyLeaves'
import LeaveDetail from './pages/staff/LeaveDetail'
import Profile from './pages/staff/Profile'
import Notifications from './pages/staff/Notifications'
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard'
import PendingApprovals from './pages/supervisor/PendingApprovals'
import TeamCalendar from './pages/supervisor/TeamCalendar'
import HRDashboard from './pages/hr/HRDashboard'
import HRQueue from './pages/hr/HRQueue'
import EmployeeManagement from './pages/hr/EmployeeManagement'
import HeadHRDashboard from './pages/headhr/HeadHRDashboard'
import FinalApprovals from './pages/headhr/FinalApprovals'
import Reports from './pages/headhr/Reports'
import AdminDashboard from './pages/admin/AdminDashboard'
import useAuthStore from './store/authStore'

const ROLES = {
  ALL:     ['EMPLOYEE', 'SUPERVISOR', 'HR_OFFICER', 'HEAD_HR', 'ADMIN'],
  HR_UP:   ['HR_OFFICER', 'HEAD_HR', 'ADMIN'],
  HEAD_UP: ['HEAD_HR', 'ADMIN'],
  SUP_UP:  ['SUPERVISOR', 'HR_OFFICER', 'HEAD_HR', 'ADMIN'],
}

const DashboardRedirect = () => {
  const { user } = useAuthStore()
  if (user?.role === 'SUPERVISOR') return <SupervisorDashboard />
  if (user?.role === 'HR_OFFICER') return <HRDashboard />
  if (user?.role === 'HEAD_HR')    return <HeadHRDashboard />
  if (user?.role === 'ADMIN')      return <AdminDashboard />
  return <Dashboard />
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
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<ProtectedRoute allowedRoles={ROLES.ALL} />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard"     element={<DashboardRedirect />} />
              <Route path="/apply-leave"   element={<ApplyLeave />} />
              <Route path="/my-leaves"     element={<MyLeaves />} />
              <Route path="/my-leaves/:id" element={<LeaveDetail />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile"       element={<Profile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={ROLES.SUP_UP} />}>
            <Route element={<AppShell />}>
              <Route path="/supervisor/pending"  element={<PendingApprovals />} />
              <Route path="/supervisor/calendar" element={<TeamCalendar />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={ROLES.HR_UP} />}>
            <Route element={<AppShell />}>
              <Route path="/hr/pending"   element={<HRQueue />} />
              <Route path="/hr/employees" element={<EmployeeManagement />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={ROLES.HEAD_UP} />}>
            <Route element={<AppShell />}>
              <Route path="/head-hr/pending" element={<FinalApprovals />} />
              <Route path="/head-hr/reports" element={<Reports />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}