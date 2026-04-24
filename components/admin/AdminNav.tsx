'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Tag, Package, Percent, Settings, LogOut, type LucideIcon } from 'lucide-react'

interface AdminNavProps {
  slug: string
  businessName: string
  userEmail: string | undefined
  logoutAction: () => Promise<void>
}

export function AdminNav({ slug, businessName, userEmail, logoutAction }: AdminNavProps) {
  const pathname = usePathname()

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

  const sectionLabel = (text: string) => (
    <p className="px-3 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">
      {text}
    </p>
  )

  return (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <p className="text-sm font-semibold text-zinc-100 truncate">{businessName}</p>
        <p className="text-xs text-zinc-500 mt-0.5">Panel Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navLink(`/negocios/${slug}/admin`, 'Dashboard', LayoutDashboard, true)}

        {sectionLabel('Catálogo')}
        {navLink(`/negocios/${slug}/admin/catalog/categories`, 'Categorías', Tag)}
        {navLink(`/negocios/${slug}/admin/catalog/products`, 'Productos', Package)}

        {sectionLabel('Marketing')}
        {navLink(`/negocios/${slug}/admin/promotions`, 'Promociones', Percent)}

        {sectionLabel('Configuración')}
        {navLink(`/negocios/${slug}/admin/settings`, 'Ajustes', Settings)}
      </nav>

      {/* User + logout */}
      <div className="border-t border-zinc-800 px-3 py-4 space-y-1">
        <div className="px-3 py-1.5">
          <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" aria-hidden />
            Cerrar sesión
          </button>
        </form>
      </div>

    </div>
  )
}
