import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import useAuthStore from '../../store/authStore'

export default function Login() {
  const { user, login } = useAuthStore()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  // Already logged in
  if (user) return <Navigate to="/dashboard" replace />

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login/', data)
      login(res.data.user, res.data.access, res.data.refresh)
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kfs-dark via-kfs-green
                    to-kfs-light flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16
                          bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-kfs-green font-black text-xl">KFS</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Kenya Forest Service</h1>
          <p className="text-green-200 text-sm mt-1">Leave Management System</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-kfs-dark text-lg font-semibold mb-5">Sign in</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@kfs.go.ke"
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Enter a valid email',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="text-right">
              
                href="/forgot-password"
                className="text-xs text-kfs-green hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-green-200 text-xs mt-6">
          © {new Date().getFullYear()} Kenya Forest Service
        </p>
      </div>
    </div>
  )
}