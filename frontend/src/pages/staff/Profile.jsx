import { useForm } from 'react-hook-form'
import { Loader2, User, Lock } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useUpdateProfile, useChangePassword } from '../../hooks/useAuth'

export default function Profile() {
  const { user } = useAuthStore()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors }
  } = useForm({ defaultValues: { name: user?.name, designation: user?.designation } })

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    watch,
    formState: { errors: pwdErrors }
  } = useForm()

  const onProfile = (data) => updateProfile.mutate(data)

  const onPassword = async (data) => {
    await changePassword.mutateAsync({
      old_password: data.old_password,
      new_password: data.new_password,
    })
    resetPwd()
  }

  return (
    <div className="page-container">
      <div className="mt-2 mb-5">
        <h1 className="text-kfs-dark">My Profile</h1>
        <p className="text-gray-500 text-sm">View and update your information</p>
      </div>

      {/* Info card */}
      <div className="card mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-kfs-green flex items-center
                          justify-center text-white text-xl font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs bg-kfs-accent text-kfs-green
                             px-2 py-0.5 rounded-full font-medium">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {[
            ['Personal No.', user?.personal_number],
            ['Department', user?.department_name || '—'],
            ['Grade', user?.grade || '—'],
            ['Designation', user?.designation || '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium text-gray-700">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit profile */}
      <div className="card mb-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-kfs-green" />
          <h3 className="section-title mb-0">Edit Profile</h3>
        </div>
        <form onSubmit={handleProfile(onProfile)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              className={`input-field ${profileErrors.name ? 'border-red-400' : ''}`}
              {...regProfile('name', { required: 'Name is required' })}
            />
            {profileErrors.name && (
              <p className="text-red-500 text-xs mt-1">{profileErrors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <input
              className="input-field"
              placeholder="e.g. Forest Officer"
              {...regProfile('designation')}
            />
          </div>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {updateProfile.isPending && (
              <Loader2 size={15} className="animate-spin" />
            )}
            Save Changes
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-kfs-green" />
          <h3 className="section-title mb-0">Change Password</h3>
        </div>
        <form onSubmit={handlePwd(onPassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              className={`input-field ${pwdErrors.old_password ? 'border-red-400' : ''}`}
              {...regPwd('old_password', { required: 'Required' })}
            />
            {pwdErrors.old_password && (
              <p className="text-red-500 text-xs mt-1">{pwdErrors.old_password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className={`input-field ${pwdErrors.new_password ? 'border-red-400' : ''}`}
              {...regPwd('new_password', {
                required: 'Required',
                minLength: { value: 8, message: 'Minimum 8 characters' }
              })}
            />
            {pwdErrors.new_password && (
              <p className="text-red-500 text-xs mt-1">{pwdErrors.new_password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className={`input-field ${pwdErrors.confirm ? 'border-red-400' : ''}`}
              {...regPwd('confirm', {
                required: 'Required',
                validate: v => v === watch('new_password') || 'Passwords do not match'
              })}
            />
            {pwdErrors.confirm && (
              <p className="text-red-500 text-xs mt-1">{pwdErrors.confirm.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {changePassword.isPending && (
              <Loader2 size={15} className="animate-spin" />
            )}
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}