'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import {
  LayoutDashboard,
  Building2,
  LogOut,
  type LucideIcon,
} from 'lucide-react'

interface SuperAdminNavProps {
  logoutAction: () => Promise<void>
}

export function SuperAdminNav({ logoutAction }: SuperAdminNavProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

  const navLink = (href: string, label: string, Icon: LucideIcon, exact = false) => (
    <Link
      key={href}
      href={href}
      className={[
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
        isActive(href, exact)
          ? 'bg-zinc-800 text-white font-medium'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
      ].join(' ')}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden />
      {label}
    </Link>
  )

  return (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <p className="text-sm font-semibold text-zinc-100">Plataforma</p>
        <p className="text-xs text-zinc-500 mt-0.5">Panel Superadmin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navLink('/superadmin', 'Dashboard', LayoutDashboard, true)}
        {navLink('/superadmin/businesses', 'Negocios', Building2)}
      </nav>

      {/* Logout */}
      <div className="border-t border-zinc-800 px-3 py-4">
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => { logoutAction() })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden />
          {isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </div>

    </div>
  )
}
