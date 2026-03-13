import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout() {
  const location = useLocation()
  const isChat = location.pathname.startsWith('/chat')

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <Sidebar />
      <div className="flex-1 ml-[240px] flex flex-col h-screen overflow-hidden">
        <Topbar />
        {isChat ? (
          // Chat gets full remaining height with no padding — manages its own layout
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        ) : (
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  )
}
