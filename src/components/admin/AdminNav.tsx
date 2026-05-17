'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { LayoutDashboard, BookOpen, Percent, Settings, LogOut, Info, HelpCircle, Images, FileText, type LucideIcon } from 'lucide-react'

interface AdminNavProps {
  slug: string
  businessName: string
  userEmail: string | undefined
  logoutAction: () => Promise<void>
  enabledPages: Record<string, boolean>
}

export function AdminNav({ slug, businessName, userEmail, logoutAction, enabledPages }: AdminNavProps) {
  const isEnabled = (id: string) => enabledPages[id] !== false
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

        {isEnabled('catalog') && sectionLabel('Catálogo')}
        {isEnabled('catalog') && navLink(`/negocios/${slug}/admin/catalog`, 'Catálogo', BookOpen)}

        {(isEnabled('about') || isEnabled('faq') || isEnabled('gallery') || isEnabled('blog')) && sectionLabel('Contenido')}
        {isEnabled('about') && navLink(`/negocios/${slug}/admin/about`, 'Nosotros', Info)}
        {isEnabled('faq') && navLink(`/negocios/${slug}/admin/faq`, 'FAQ', HelpCircle)}
        {isEnabled('gallery') && navLink(`/negocios/${slug}/admin/gallery`, 'Galería', Images)}
        {isEnabled('blog') && navLink(`/negocios/${slug}/admin/blog`, 'Blog', FileText)}

        {isEnabled('promotions') && sectionLabel('Marketing')}
        {isEnabled('promotions') && navLink(`/negocios/${slug}/admin/promotions`, 'Promociones', Percent)}

        {sectionLabel('Configuración')}
        {navLink(`/negocios/${slug}/admin/business`, 'Ajustes', Settings)}
      </nav>

      {/* User + logout */}
      <div className="border-t border-zinc-800 px-3 py-4 space-y-1">
        <div className="px-3 py-1.5">
          <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
        </div>
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
