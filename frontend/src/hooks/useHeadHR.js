import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/axios'
import toast from 'react-hot-toast'

export const usePendingHeadHR = () =>
  useQuery({
    queryKey: ['pending-head-hr'],
    queryFn: () => api.get('/leaves/pending/head-hr/').then(r => r.data),
  })

export const useHeadHRApproval = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.post(`/leaves/${id}/final-approval/`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries(['pending-head-hr'])
      qc.invalidateQueries(['all-leaves'])
      toast.success(
        vars.data.action === 'APPROVE'
          ? 'Leave fully approved! PDF will be generated.'
          : 'Leave request rejected.'
      )
    },
    onError: (err) =>
      toast.error(err.response?.data?.detail || 'Action failed.'),
  })
}

export const useReportsData = (year) =>
  useQuery({
    queryKey: ['reports', year],
    queryFn: () =>
      api.get(`/leaves/all/?year=${year}`).then(r => {
        const data = r.data?.results || r.data || []
        return data
      }),
  })