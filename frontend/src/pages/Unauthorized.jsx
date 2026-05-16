import { useNavigate } from 'react-router-dom'

export default function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-6xl mb-4">🔒</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-500 text-center mb-6">
        You don't have permission to view this page.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="btn-primary max-w-xs"
      >
        Go Back
      </button>
    </div>
  )
}