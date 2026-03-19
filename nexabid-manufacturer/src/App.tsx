import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import CategorySelectPage from '@/pages/CategorySelectPage'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import BrowseOrdersPage from '@/pages/orders/BrowseOrdersPage'
import MyOrdersPage from '@/pages/orders/MyOrdersPage'
import OrderDetailPage from '@/pages/orders/OrderDetailPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import ChatPage from '@/pages/chat/ChatPage'
import ProtectedRoute from '@/components/ui/ProtectedRoute'

<<<<<<< HEAD
import EarningsPage from '@/pages/earnings/EarningsPage'
import SettingsPage from '@/pages/settings/SettingsPage'
=======
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-800 mb-2">{title}</p>
      <p className="text-gray-400 text-sm">Coming soon</p>
    </div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/select-categories" element={<CategorySelectPage />} />

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/browse" element={<BrowseOrdersPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:orderId" element={<ChatPage />} />
<<<<<<< HEAD
            <Route path="/earnings" element={<EarningsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
=======
            <Route path="/earnings" element={<Placeholder title="Earnings" />} />
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
