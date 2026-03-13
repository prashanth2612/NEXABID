import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { Factory, Star } from 'lucide-react'

export default function DashboardPage() {
  const { manufacturer, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full mx-4 text-center shadow-sm border border-gray-100">
        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Factory size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Welcome, {manufacturer?.fullName?.split(' ')[0]}! 🏭
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          You're logged in as a manufacturer. The swipe dashboard is coming next.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{manufacturer?.email}</span>
          </div>
          {manufacturer?.businessName && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Business</span>
              <span className="font-medium">{manufacturer.businessName}</span>
            </div>
          )}
          {manufacturer?.category && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Category</span>
              <span className="font-medium">{manufacturer.category}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Rating</span>
            <span className="flex items-center gap-1 font-medium">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              New Account
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="text-orange-600 font-medium text-xs bg-orange-50 px-2 py-0.5 rounded-full">
              {manufacturer?.isVerified ? 'Verified' : 'Pending Verification'}
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
