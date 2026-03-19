import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import UsersPage from '@/pages/users/UsersPage'
<<<<<<< HEAD
import UserDetailPage from '@/pages/users/UserDetailPage'
import OrdersPage from '@/pages/orders/OrdersPage'
import AdminOrderDetailPage from '@/pages/orders/OrderDetailPage'
=======
import OrdersPage from '@/pages/orders/OrdersPage'
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
import BidsPage from '@/pages/bids/BidsPage'
import PaymentsPage from '@/pages/payments/PaymentsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
<<<<<<< HEAD
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
=======
          <Route path="orders" element={<OrdersPage />} />
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
          <Route path="bids" element={<BidsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
