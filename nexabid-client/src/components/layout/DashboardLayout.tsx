import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import NotificationToasts from '@/components/NotificationToasts'
import OnboardingTour from '@/components/OnboardingTour'

export default function DashboardLayout() {
  const location = useLocation()
  const isChat = location.pathname.startsWith('/chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-[240px] flex flex-col h-screen overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(o => !o)} />
        {isChat ? (
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        ) : (
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        )}
      </div>
      <NotificationToasts />
      <OnboardingTour />
    </div>
  )
}
