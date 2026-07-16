'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  History,
  User,
  Settings,
  LogOut,
  BadgeEuro,
  BookOpen,
  ClipboardCheck,
  Dumbbell,
  MessageSquare,
  Menu,
  Star,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { signout } from '@/actions/auth'

const primaryItems = [
  { label: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Atletas', href: '/dashboard/clients', icon: User },
  { label: 'Agenda', href: '/dashboard/history', icon: History },
  { label: 'Mensajes', href: '/dashboard/messages', icon: MessageSquare },
]

const moreItems = [
  { label: 'Grupos', href: '/dashboard/groups', icon: Users },
  { label: 'Favoritos', href: '/dashboard/favorites', icon: Star },
  { label: 'Biblioteca', href: '/dashboard/workouts', icon: BookOpen },
  { label: 'Ejercicios', href: '/dashboard/exercises', icon: Dumbbell },
  { label: 'Check-ins', href: '/dashboard/checkins', icon: ClipboardCheck },
  { label: 'Pagos', href: '/dashboard/payments', icon: BadgeEuro },
  { label: 'Perfil', href: '/dashboard/profile', icon: User },
  { label: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

interface MobileNavProps {
  userName?: string
  userEmail?: string
}

function isItemActive(href: string, pathname: string) {
  return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
}

export function MobileNav({ userName = 'Coach', userEmail = '' }: MobileNavProps) {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const moreIsActive = moreItems.some((item) => isItemActive(item.href, pathname))

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-white/[0.08] bg-[#0B111C]/95 backdrop-blur-xl md:hidden">
        {primaryItems.map((item) => {
          const active = isItemActive(item.href, pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                active ? 'text-brand' : 'text-[#64748B]'
              )}
            >
              <item.icon className="h-5 w-5" size={20} />
              {item.label}
            </Link>
          )
        })}
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
            moreIsActive || isMoreOpen ? 'text-brand' : 'text-[#64748B]'
          )}
        >
          <Menu className="h-5 w-5" size={20} />
          Más
        </button>
      </nav>

      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setIsMoreOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/[0.08] bg-[#0B111C] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl shadow-black/50">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-white">Más opciones</p>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {moreItems.map((item) => {
                const active = isItemActive(item.href, pathname)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-2xl border p-3 text-center text-xs font-medium transition-colors',
                      active
                        ? 'border-brand/25 bg-brand/10 text-brand'
                        : 'border-white/[0.06] bg-white/[0.03] text-[#94A3B8]'
                    )}
                  >
                    <item.icon className="h-5 w-5" size={20} />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand2/30 to-brand/30 text-sm font-semibold text-white ring-1 ring-white/10">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{userName}</p>
                {userEmail && <p className="truncate text-xs text-[#475569]">{userEmail}</p>}
              </div>
              <form action={signout}>
                <button
                  type="submit"
                  aria-label="Cerrar sesión"
                  className="shrink-0 text-[#475569] hover:text-[#F87171] transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
