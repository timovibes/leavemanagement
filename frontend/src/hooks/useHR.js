import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export const usePendingHR = () =>
  useQuery({
    queryKey: ['pending-hr'],
    queryFn: () => api.get('/leaves/pending/hr/').then(r => r.data),
  })

export const useAllLeaves = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.status)     params.append('status', filters.status)
  if (filters.department) params.append('department', filters.department)
  if (filters.year)       params.append('year', filters.year)
  return useQuery({
    queryKey: ['all-leaves', filters],
    queryFn: () => api.get(`/leaves/all/?${params}`).then(r => r.data),
  })
}

export const useEmployees = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.department) params.append('department', filters.department)
  if (filters.role)       params.append('role', filters.role)
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => api.get(`/auth/employees/?${params}`).then(r => r.data),
  })
}

export const useCreateEmployee = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/auth/register/', data),
    onSuccess: () => {
      qc.invalidateQueries(['employees'])
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
      qc.invalidateQueries(['employees'])
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
        .then(r => r.data),
    enabled: !!employeeId,
  })

export const useHRReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/leaves/${id}/hr-review/`, data),
    onSuccess: () => {
      qc.invalidateQueries(['pending-hr'])
      qc.invalidateQueries(['all-leaves'])
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
      qc.invalidateQueries(['pending-hr'])
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
      qc.invalidateQueries(['pending-hr'])
      toast.success('Part V verified — forwarded to Head HR.')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed.'),
  })
}

export const useDepartments = () =>
  useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/auth/employees/?role=SUPERVISOR')
      .then(r => r.data),
  })