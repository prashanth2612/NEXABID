import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Package, Gavel, CreditCard, LogOut, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard',  path: '/',         icon: LayoutDashboard },
  { label: 'Users',      path: '/users',     icon: Users },
  { label: 'Orders',     path: '/orders',    icon: Package },
  { label: 'Bids',       path: '/bids',      icon: Gavel },
  { label: 'Payments',   path: '/payments',  icon: CreditCard },
]

export default function Sidebar() {
  const location = useLocation()
  const { admin, logout } = useAuthStore()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-[#0A0A0A] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-[#0A0A0A]" />
          </div>
          <div>
            <p className="text-white text-sm font-bold tracking-tight">NexaBid</p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, path, icon: Icon }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
          return (
            <Link key={path} to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-white text-[#0A0A0A]' : 'text-white/50 hover:text-white hover:bg-white/10'
              )}>
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{admin?.fullName?.charAt(0) || 'A'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{admin?.fullName || 'Admin'}</p>
            <p className="text-white/40 text-[10px] truncate">{admin?.email}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-white/50 hover:text-white hover:bg-white/10 text-sm transition-all">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
