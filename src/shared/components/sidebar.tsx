'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  History,
  User,
  Settings,
  ChevronRight,
  LogOut,
  BadgeEuro,
  ClipboardCheck,
  ClipboardList,
  Dumbbell,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { BrandMark } from '@/shared/components/brand-mark'
import { signout } from '@/actions/auth'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Clientes',
    href: '/dashboard/clients',
    icon: User,
  },
  {
    label: 'Planes',
    href: '/dashboard/workouts',
    icon: ClipboardList,
  },
  {
    label: 'Ejercicios',
    href: '/dashboard/exercises',
    icon: Dumbbell,
  },
  {
    label: 'Check-ins',
    href: '/dashboard/checkins',
    icon: ClipboardCheck,
  },
  {
    label: 'Agenda',
    href: '/dashboard/history',
    icon: History,
  },
  {
    label: 'Pagos',
    href: '/dashboard/payments',
    icon: BadgeEuro,
  },
  {
    label: 'Mensajes',
    href: '/dashboard/messages',
    icon: MessageSquare,
  },
  {
    label: 'Perfil',
    href: '/dashboard/profile',
    icon: User,
  },
]

const bottomItems = [
  {
    label: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  userName?: string
  userEmail?: string
}

export function Sidebar({
  userName = 'Carlos',
  userEmail = 'carlosaguayoarrabal2026@gmail.com',
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/[0.06] bg-[#080C14]/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-5">
        <BrandMark />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#FF6A00]/10 text-[#FF6A00]'
                    : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon
                  className={cn(
                    'h-4.5 w-4.5 shrink-0 transition-colors',
                    isActive ? 'text-[#FF6A00]' : 'text-[#475569] group-hover:text-white'
                  )}
                  size={18}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-white/[0.06]" />

        {/* Upgrade banner */}
        <div className="rounded-2xl border border-[#FF6A00]/20 bg-gradient-to-br from-[#FF6A00]/10 to-[#FFB000]/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <BadgeEuro className="h-4 w-4 text-[#FF6A00]" />
            <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider">Pro Plan</span>
          </div>
          <p className="mb-3 text-xs text-[#94A3B8] leading-relaxed">
            Automatiza pagos y desbloquea clientes ilimitados
          </p>
          <Link
            href="/dashboard/upgrade"
            className="flex items-center gap-1 text-xs font-semibold text-[#FF6A00] hover:gap-2 transition-all"
          >
            Ver planes
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/[0.06] px-3 py-3">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#94A3B8] hover:bg-white/5 hover:text-white transition-all"
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </Link>
        ))}

        {/* User info */}
        <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-all group">
          <Link href="/dashboard/profile" className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFB000]/30 to-[#FF6A00]/30 text-sm font-semibold text-white ring-1 ring-white/10">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{userName}</p>
              <p className="truncate text-xs text-[#475569]">{userEmail}</p>
            </div>
          </Link>
          <form action={signout}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              className="shrink-0 text-[#475569] hover:text-[#F87171] transition-colors"
            >
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
