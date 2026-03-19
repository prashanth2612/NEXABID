import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import OrdersPage from '@/pages/orders/OrdersPage'
import CreateOrderPage from '@/pages/orders/CreateOrderPage'
import OrderDetailPage from '@/pages/orders/OrderDetailPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import PaymentsPage from '@/pages/payments/PaymentsPage'
import ChatPage from '@/pages/chat/ChatPage'
import ProtectedRoute from '@/components/ui/ProtectedRoute'

import SettingsPage from '@/pages/settings/SettingsPage'

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
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/create" element={<CreateOrderPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:orderId" element={<ChatPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
