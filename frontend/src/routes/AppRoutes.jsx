import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ui/ProtectedRoute';

import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';

import StaffDashboard from '../pages/staff/Dashboard';
import ApplyLeave from '../pages/staff/ApplyLeave';
import MyLeaves from '../pages/staff/MyLeaves';
import LeaveDetail from '../pages/staff/LeaveDetail';
import Notifications from '../pages/staff/Notifications';
import Profile from '../pages/staff/Profile';

import SupervisorDashboard from '../pages/supervisor/Dashboard';
import PendingApprovals from '../pages/supervisor/PendingApprovals';
import TeamCalendar from '../pages/supervisor/TeamCalendar';

import HRDashboard from '../pages/hr/Dashboard';
import HRQueue from '../pages/hr/HRQueue';
import HREmployees from '../pages/hr/Employees';

import HeadHRDashboard from '../pages/headhr/Dashboard';
import FinalApprovals from '../pages/headhr/FinalApprovals';
import HeadHREmployees from '../pages/headhr/Employees';
import HeadHRReports from '../pages/headhr/Reports';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminEmployees from '../pages/admin/Employees';
import AdminHRQueue from '../pages/admin/HRQueue';
import AdminReports from '../pages/admin/Reports';

import Unauthorized from '../pages/Unauthorized';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/" element={<ProtectedRoute roles={['staff']} />}>
        <Route index element={<StaffDashboard />} />
        <Route path="apply-leave" element={<ApplyLeave />} />
        <Route path="my-leaves" element={<MyLeaves />} />
        <Route path="my-leaves/:id" element={<LeaveDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/supervisor" element={<ProtectedRoute roles={['supervisor']} />}>
        <Route index element={<SupervisorDashboard />} />
        <Route path="approvals" element={<PendingApprovals />} />
        <Route path="calendar" element={<TeamCalendar />} />
      </Route>

      <Route path="/hr" element={<ProtectedRoute roles={['hr']} />}>
        <Route index element={<HRDashboard />} />
        <Route path="queue" element={<HRQueue />} />
        <Route path="employees" element={<HREmployees />} />
      </Route>

      <Route path="/headhr" element={<ProtectedRoute roles={['headhr']} />}>
        <Route index element={<HeadHRDashboard />} />
        <Route path="approvals" element={<FinalApprovals />} />
        <Route path="employees" element={<HeadHREmployees />} />
        <Route path="reports" element={<HeadHRReports />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute roles={['admin']} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="queue" element={<AdminHRQueue />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>
    </Routes>
  );
}
