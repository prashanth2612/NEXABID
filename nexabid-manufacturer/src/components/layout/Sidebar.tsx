import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Layers, Package,
  MessageSquare, CreditCard, User, LogOut, ChevronRight, Settings,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  {
    group: 'Main',
    items: [
      { label: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard' },
      { label: 'Browse Orders', icon: Layers,          path: '/browse' },
      { label: 'My Orders',    icon: Package,          path: '/orders' },
    ],
  },
  {
    group: 'Activity',
    items: [
      { label: 'Messages',     icon: MessageSquare,    path: '/chat' },
      { label: 'Earnings',     icon: CreditCard,       path: '/earnings' },
    ],
  },
  {
    group: 'Account',
    items: [
      { label: 'Profile',      icon: User,             path: '/profile' },
      { label: 'Settings',     icon: Settings,         path: '/settings' },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="w-[240px] min-h-screen bg-[#0A0A0A] flex flex-col fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-xs tracking-tighter">NB</span>
          </div>
          <div>
            <span className="text-white font-semibold text-sm tracking-tight">NexaBid</span>
            <span className="block text-white/30 text-[10px] tracking-wide uppercase">Manufacturer</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group} className="mb-6">
            <p className="text-white/25 text-[10px] uppercase tracking-[0.15em] font-medium px-2 mb-2">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group',
                      active
                        ? 'bg-white text-black font-medium'
                        : 'text-white/55 hover:text-white hover:bg-white/[0.07]'
                    )}
                  >
                    <item.icon size={15} className="flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={12} className="opacity-40" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.fullName}</p>
            <p className="text-white/35 text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
