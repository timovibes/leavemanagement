export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const ROLES = {
  STAFF: 'staff',
  SUPERVISOR: 'supervisor',
  HR: 'hr',
  HEAD_HR: 'headhr',
  ADMIN: 'admin',
};

export const LEAVE_STATUS = {
  PENDING: 'pending',
  SUPERVISOR_APPROVED: 'supervisor_approved',
  HR_APPROVED: 'hr_approved',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export const LEAVE_TYPES = {
  ANNUAL: 'annual',
  SICK: 'sick',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  UNPAID: 'unpaid',
  COMPASSIONATE: 'compassionate',
};
