import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full mx-4 text-center shadow-sm border border-gray-100">
        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-white font-bold text-sm">NB</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Welcome, {user?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          You're logged in as a client. Dashboard coming in the next step.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Role</span>
            <span className="font-medium capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="text-orange-600 font-medium text-xs bg-orange-50 px-2 py-0.5 rounded-full">
              {user?.isVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
