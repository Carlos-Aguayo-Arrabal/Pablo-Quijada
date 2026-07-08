'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { BrandMark } from '@/shared/components/brand-mark'

interface NavbarProps {
  variant?: 'landing' | 'transparent'
}

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Funciones', href: '/#funciones' },
  { label: 'Flujo', href: '/#flujo' },
  { label: 'Precios', href: '/#precios' },
]

export function Navbar({ variant = 'landing' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        'backdrop-blur-xl border-b border-white/5',
        variant === 'transparent'
          ? 'bg-transparent'
          : 'bg-[#080C14]/80'
      )}
    >
      <div className="container-fit flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group">
          <BrandMark />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/8 bg-white/4 px-2 py-1.5 backdrop-blur-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm text-white/70 transition-all hover:bg-white/8 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/auth/login/L2Rhc2hib2FyZA%3D%3D"
            className="text-sm text-white/70 transition-colors hover:text-white"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className="btn-primary text-sm py-2 px-5"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex lg:hidden items-center justify-center rounded-lg p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Toggle menu"
          id="mobile-menu-btn"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-white/8 bg-[#080C14]/95 backdrop-blur-xl">
          <div className="container-fit py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-white/8 flex flex-col gap-2">
              <Link
                href="/auth/login/L2Rhc2hib2FyZA%3D%3D"
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-center text-white/70 border border-white/10 hover:bg-white/5 transition-all"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="btn-primary text-sm justify-center"
              >
                Empezar gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
