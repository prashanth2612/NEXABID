import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/orders': 'Orders',
  '/bids': 'Bids',
  '/payments': 'Payments',
}

export default function DashboardLayout() {
  const location = useLocation()
  const title = Object.entries(TITLES).find(([p]) =>
    p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
  )?.[1] || 'Admin'

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <Sidebar />
      <div className="flex-1 ml-[220px] flex flex-col min-h-screen">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 sticky top-0 z-30">
          <h1 className="text-sm font-semibold text-[#0A0A0A]">{title}</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
