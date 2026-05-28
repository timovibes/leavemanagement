import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/axios'
import toast from 'react-hot-toast'

const toArray = (data) => Array.isArray(data) ? data : (data?.results ?? [])

export const usePendingSupervisor = () =>
  useQuery({
    queryKey: ['pending-supervisor'],
    queryFn: () => api.get('/leaves/pending/supervisor/').then(r => toArray(r.data)),
  })

export const useTeamLeaves = () =>
  useQuery({
    queryKey: ['team-leaves'],
    queryFn: () => api.get('/leaves/team/').then(r => toArray(r.data)),
  })

export const useTeamMembers = () =>
  useQuery({
    queryKey: ['team-members'],
    queryFn: () => api.get('/accounts/employees/').then(r => toArray(r.data)),
  })

export const useSupervisorReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) =>
      api.post(`/leaves/${id}/supervisor-review/`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries(['pending-supervisor'])
      qc.invalidateQueries(['team-leaves'])
      const action = vars.data.action
      toast.success(
        action === 'APPROVE'
          ? 'Leave approved and forwarded to HR.'
          : 'Leave request rejected.'
      )
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Action failed.')
    },
  })
}