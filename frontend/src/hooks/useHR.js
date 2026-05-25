import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/axios'
import toast from 'react-hot-toast'

const toArray = (data) => Array.isArray(data) ? data : (data?.results ?? [])

export const usePendingHR = () =>
  useQuery({
    queryKey: ['pending-hr'],
    queryFn: () => api.get('/leaves/pending/hr/').then(r => toArray(r.data)),
  })

export const useAllLeaves = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.status)     params.append('status', filters.status)
  if (filters.department) params.append('department', filters.department)
  if (filters.year)       params.append('year', filters.year)
  return useQuery({
    queryKey: ['all-leaves', filters],
    queryFn: () => api.get(`/leaves/all/?${params}`).then(r => toArray(r.data)),
  })
}

export const useEmployees = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.department) params.append('department', filters.department)
  if (filters.role)       params.append('role', filters.role)
  params.append('page_size', 1000)   // ✅ fetch all employees, not just first 20

  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => api.get(`/auth/employees/?${params}`).then(r => toArray(r.data)),
  })
}

export const useCreateEmployee = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/auth/register/', data),
    onSuccess: () => {
      // ✅ Fix: v5 requires object syntax — v4 array syntax was silently ignored
      qc.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Employee created successfully.')
    },
    onError: (err) => {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat().join(' ')
        : 'Failed to create employee.'
      toast.error(msg)
    },
  })
}

export const useUpdateEmployee = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/auth/employees/${id}/`, data),
    onSuccess: () => {
      // ✅ Fix: same v5 object syntax
      qc.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Employee updated.')
    },
    onError: () => toast.error('Update failed.'),
  })
}

export const useLeaveBalances = (employeeId) =>
  useQuery({
    queryKey: ['employee-balances', employeeId],
    queryFn: () =>
      api.get(`/leaves/balances/?employee=${employeeId}`)
        .then(r => toArray(r.data)),
    enabled: !!employeeId,
  })

export const useHRReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/leaves/${id}/hr-review/`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-hr'] })
      qc.invalidateQueries({ queryKey: ['all-leaves'] })
      toast.success('Part III completed — moved to HR Check.')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed.'),
  })
}

export const useHRAllowance = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/leaves/${id}/hr-allowance/`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-hr'] })
      toast.success('Part IV — allowance confirmed.')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed.'),
  })
}

export const useHRVerify = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/leaves/${id}/hr-verify/`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-hr'] })
      toast.success('Part V verified — forwarded to Head HR.')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed.'),
  })
}

// ✅ Fix: was fetching supervisors instead of the departments endpoint
export const useDepartments = () =>
  useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/auth/departments/').then(r => toArray(r.data)),
  })