import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/axios'
import toast from 'react-hot-toast'

const toArray = (data) => Array.isArray(data) ? data : (data?.results ?? [])

export const useLeaveBalances = (year) =>
  useQuery({
    queryKey: ['balances', year],
    queryFn: () => api.get(`/leaves/balances/?year=${year}`).then(r => toArray(r.data)),
  })

export const useLeaveTypes = () =>
  useQuery({
    queryKey: ['leave-types'],
    queryFn: () => api.get('/leaves/types/').then(r => toArray(r.data)),
  })

export const useMyLeaves = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.year)       params.append('year', filters.year)
  if (filters.status)     params.append('status', filters.status)
  if (filters.leave_type) params.append('leave_type', filters.leave_type)

  return useQuery({
    queryKey: ['my-leaves', filters],
    queryFn: () => api.get(`/leaves/my/?${params}`).then(r => toArray(r.data)),
  })
}

export const useLeaveDetail = (id) =>
  useQuery({
    queryKey: ['leave', id],
    queryFn: () => api.get(`/leaves/${id}/`).then(r => r.data),
    enabled: !!id,
  })

export const useApplyLeave = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/leaves/apply/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      qc.invalidateQueries(['my-leaves'])
      qc.invalidateQueries(['balances'])
      toast.success('Leave application saved as draft.')
    },
    onError: (err) => {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat().join(' ')
        : 'Failed to apply. Try again.'
      toast.error(msg)
    },
  })
}

export const useSubmitLeave = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/leaves/${id}/submit/`),
    onSuccess: () => {
      qc.invalidateQueries(['my-leaves'])
      toast.success('Leave submitted for approval.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Submission failed.')
    },
  })
}

export const useDeleteLeave = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/leaves/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries(['my-leaves'])
      toast.success('Draft deleted.')
    },
    onError: () => toast.error('Could not delete.'),
  })
}

export const useCalculateDays = () =>
  useMutation({
    mutationFn: ({ from_date, to_date }) =>
      api.get(`/leaves/calculate-days/?from_date=${from_date}&to_date=${to_date}`)
        .then(r => r.data.working_days),
  })