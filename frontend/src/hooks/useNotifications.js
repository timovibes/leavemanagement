import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/axios'

export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications/').then(r => r.data),
    refetchInterval: 30000, // poll every 30s
  })

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['unread-count'],
    queryFn: () => api.get('/notifications/unread-count/').then(r => r.data.unread_count),
    refetchInterval: 30000,
  })

export const useMarkAllRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read/'),
    onSuccess: () => {
      qc.invalidateQueries(['notifications'])
      qc.invalidateQueries(['unread-count'])
    },
  })
}