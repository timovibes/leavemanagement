import { useMutation } from '@tanstack/react-query'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export const useUpdateProfile = () => {
  const { updateUser } = useAuthStore()
  return useMutation({
    mutationFn: (data) => api.patch('/auth/me/', data),
    onSuccess: (res) => {
      updateUser(res.data)
      toast.success('Profile updated.')
    },
    onError: () => toast.error('Update failed.'),
  })
}

export const useChangePassword = () =>
  useMutation({
    mutationFn: (data) => api.post('/auth/change-password/', data),
    onSuccess: () => toast.success('Password changed successfully.'),
    onError: (err) => {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to change password.'
      toast.error(msg)
    },
  })