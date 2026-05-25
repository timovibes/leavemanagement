import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/axios'
import toast from 'react-hot-toast'

export const useDepartments = () =>
  useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/auth/departments/').then(r => r.data?.results || r.data || []),
  })

export const useCreateDepartment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/auth/departments/', data),
    onSuccess: () => { qc.invalidateQueries(['departments']); toast.success('Department created.') },
    onError: () => toast.error('Failed to create department.'),
  })
}

export const useUpdateDepartment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/auth/departments/${id}/`, data),
    onSuccess: () => { qc.invalidateQueries(['departments']); toast.success('Department updated.') },
    onError: () => toast.error('Failed to update department.'),
  })
}

export const useDeleteDepartment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/auth/departments/${id}/`),
    onSuccess: () => { qc.invalidateQueries(['departments']); toast.success('Department deleted.') },
    onError: () => toast.error('Failed to delete department.'),
  })
}

export const useLeaveTypesAdmin = () =>
  useQuery({
    queryKey: ['leave-types-admin'],
    queryFn: () => api.get('/leaves/types/').then(r => r.data?.results || r.data || []),
  })

export const useCreateLeaveType = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/leaves/types/', data),
    onSuccess: () => { qc.invalidateQueries(['leave-types-admin']); toast.success('Leave type created.') },
    onError: () => toast.error('Failed to create leave type.'),
  })
}

export const useUpdateLeaveType = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/leaves/types/${id}/`, data),
    onSuccess: () => { qc.invalidateQueries(['leave-types-admin']); toast.success('Leave type updated.') },
    onError: () => toast.error('Failed to update leave type.'),
  })
}

export const useDeleteLeaveType = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/leaves/types/${id}/`),
    onSuccess: () => { qc.invalidateQueries(['leave-types-admin']); toast.success('Leave type deleted.') },
    onError: () => toast.error('Failed to delete leave type.'),
  })
}

export const usePublicHolidays = () =>
  useQuery({
    queryKey: ['public-holidays'],
    queryFn: () => api.get('/leaves/holidays/').then(r => r.data?.results || r.data || []),
  })

export const useCreateHoliday = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/leaves/holidays/', data),
    onSuccess: () => { qc.invalidateQueries(['public-holidays']); toast.success('Holiday added.') },
    onError: () => toast.error('Failed to add holiday.'),
  })
}

export const useDeleteHoliday = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/leaves/holidays/${id}/`),
    onSuccess: () => { qc.invalidateQueries(['public-holidays']); toast.success('Holiday deleted.') },
    onError: () => toast.error('Failed to delete holiday.'),
  })
}