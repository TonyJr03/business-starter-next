'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminNavProps {
  slug: string
  userEmail: string | undefined
  logoutAction: () => Promise<void>
}

interface NavItem {
  href: string
  label: string
  /** true = coincidencia exacta; false = startsWith */
  exact?: boolean
}

export function AdminNav({ slug, userEmail, logoutAction }: AdminNavProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

  const linkClass = (href: string, exact = false) =>
    [
      'block px-3 py-2 rounded-md text-sm transition-colors',
      isActive(href, exact)
        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium'
        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
    ].join(' ')

  const dashboardHref = `/negocios/${slug}/admin`

  const catalogItems: NavItem[] = [
    { href: `/negocios/${slug}/admin/catalog/categories`, label: 'Categorías' },
    { href: `/negocios/${slug}/admin/catalog/products`,   label: 'Productos'  },
  ]

  return (
    <nav className="space-y-1">
      <p className="font-semibold text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-4 px-3">
        Administración
      </p>

      <Link href={dashboardHref} className={linkClass(dashboardHref, true)}>
        Dashboard
      </Link>

      {/* Catálogo */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 my-3" />
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-1">
        Catálogo
      </p>
      {catalogItems.map(item => (
        <Link key={item.href} href={item.href} className={linkClass(item.href)}>
          {item.label}
        </Link>
      ))}

      {/* Promociones */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 my-3" />
      <Link
        href={`/negocios/${slug}/admin/promotions`}
        className={linkClass(`/negocios/${slug}/admin/promotions`)}
      >
        Promociones
      </Link>

      {/* Ajustes */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 my-3" />
      <Link
        href={`/negocios/${slug}/admin/settings`}
        className={linkClass(`/negocios/${slug}/admin/settings`)}
      >
        Ajustes
      </Link>

      {/* Sesión */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 my-3" />
      <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
        {userEmail}
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full text-left px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm text-red-600 dark:text-red-400 transition-colors"
        >
          Cerrar sesión
        </button>
      </form>
    </nav>
  )
}
