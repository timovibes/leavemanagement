import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import queryClient from './lib/queryClient'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import Unauthorized from './pages/Unauthorized'

// Auth pages (lazy-loaded in later phases)
import Login from './pages/auth/Login'

import ForgotPassword from './pages/auth/ForgotPassword'

// Placeholder pages (replaced phase by phase)
const Placeholder = ({ title }) => (
  <div className="page-container">
    <div className="card mt-6">
      <h2 className="text-kfs-green">{title}</h2>
      <p className="text-gray-400 mt-1 text-sm">Coming in next phase...</p>
    </div>
  </div>
)

const ROLES = {
  ALL:      ['EMPLOYEE', 'SUPERVISOR', 'HR_OFFICER', 'HEAD_HR', 'ADMIN'],
  HR_UP:    ['HR_OFFICER', 'HEAD_HR', 'ADMIN'],
  HEAD_UP:  ['HEAD_HR', 'ADMIN'],
  SUP_UP:   ['SUPERVISOR', 'HR_OFFICER', 'HEAD_HR', 'ADMIN'],
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
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected — all roles */}
          <Route element={<ProtectedRoute allowedRoles={ROLES.ALL} />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard"
                element={<Placeholder title="Dashboard" />} />
              <Route path="/apply-leave"
                element={<Placeholder title="Apply Leave" />} />
              <Route path="/my-leaves"
                element={<Placeholder title="My Leaves" />} />
              <Route path="/notifications"
                element={<Placeholder title="Notifications" />} />
              <Route path="/profile"
                element={<Placeholder title="Profile" />} />
            </Route>
          </Route>

          {/* Supervisor+ */}
          <Route element={<ProtectedRoute allowedRoles={ROLES.SUP_UP} />}>
            <Route element={<AppShell />}>
              <Route path="/supervisor/pending"
                element={<Placeholder title="Pending Approvals" />} />
              <Route path="/supervisor/calendar"
                element={<Placeholder title="Team Calendar" />} />
            </Route>
          </Route>

          {/* HR+ */}
          <Route element={<ProtectedRoute allowedRoles={ROLES.HR_UP} />}>
            <Route element={<AppShell />}>
              <Route path="/hr/pending"
                element={<Placeholder title="HR Queue" />} />
              <Route path="/hr/employees"
                element={<Placeholder title="Employee Management" />} />
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}