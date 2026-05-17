import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: JSON.parse(sessionStorage.getItem('user') || 'null'),
  accessToken: sessionStorage.getItem('access_token') || null,

  login: (userData, access, refresh) => {
    sessionStorage.setItem('access_token', access)
    sessionStorage.setItem('refresh_token', refresh)
    sessionStorage.setItem('user', JSON.stringify(userData))
    set({ user: userData, accessToken: access })
  },

  logout: () => {
    sessionStorage.clear()
    set({ user: null, accessToken: null })
  },

  updateUser: (userData) => {
    sessionStorage.setItem('user', JSON.stringify(userData))
    set({ user: userData })
  },
}))

export default useAuthStore