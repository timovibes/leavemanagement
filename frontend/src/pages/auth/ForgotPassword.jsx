import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password/', data)
      setSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kfs-dark via-kfs-green
                    to-kfs-light flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <Link to="/login"
            className="flex items-center gap-1 text-kfs-green text-sm mb-4 hover:underline">
            <ArrowLeft size={14} /> Back to login
          </Link>

          <h2 className="text-kfs-dark font-semibold text-lg mb-1">
            Reset Password
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Enter your email and we'll send a reset link.
          </p>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 text-sm font-medium">Email sent!</p>
              <p className="text-green-600 text-xs mt-1">
                Check your inbox for the reset link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@kfs.go.ke"
                  className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}