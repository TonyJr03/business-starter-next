/**
 * Layout del área admin
 *
 * Rutas protegidas:
 * - /negocios/[slug]/admin
 * - /negocios/[slug]/admin/*
 *
 * Responsabilidades:
 * 1. Verifica sesión con getUser() (verificación segura contra el servidor)
 *    → redirige a /negocios/[slug]/login si no hay usuario
 * 2. Proporciona la estructura visual del área admin
 *
 * Capas de protección:
 * - proxy.ts: guard optimista (cookie) — primera línea rápida
 * - Este layout: guard seguro (red) — segunda línea antes del render
 *
 * TODO M5: reemplazar sidebar placeholder por el panel real.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { logoutAction } from '@/actions/auth'
import type { ReactNode } from 'react'

interface AdminLayoutProps {
  params: Promise<{ slug: string }>
  children: ReactNode
}

export default async function AdminLayout({ params, children }: AdminLayoutProps) {
  const { slug } = await params

  // Guard seguro: getUser() verifica el JWT contra el servidor de Supabase Auth.
  // Si no hay sesión válida, redirige al login del tenant.
  const user = await getUser()
  if (!user) {
    redirect(`/negocios/${slug}/login`)
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar admin — placeholder M3 */}
      <aside className="w-52 shrink-0 border-r border-zinc-200 dark:border-zinc-800 pr-6">
        <nav className="space-y-1">
          <p className="font-semibold text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-4 px-3">
            Administración
          </p>

          <Link
            href={`/negocios/${slug}/admin`}
            className="block px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition-colors"
          >
            Dashboard
          </Link>

          {/* Separador */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 my-3" />

          {/* Catálogo */}
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-1">
            Catálogo
          </p>
          <Link
            href={`/negocios/${slug}/admin/catalog/categories`}
            className="block px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition-colors"
          >
            Categorías
          </Link>
          <Link
            href={`/negocios/${slug}/admin/catalog/products`}
            className="block px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition-colors"
          >
            Productos
          </Link>

          {/* Promociones */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 my-3" />
          <Link
            href={`/negocios/${slug}/admin/promotions`}
            className="block px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition-colors text-zinc-400 dark:text-zinc-500"
          >
            Promociones
          </Link>

          {/* Ajustes */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 my-3" />
          <Link
            href={`/negocios/${slug}/admin/settings`}
            className="block px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition-colors text-zinc-400 dark:text-zinc-500"
          >
            Ajustes
          </Link>

          <div className="border-t border-zinc-100 dark:border-zinc-800 my-3" />

          {/* Sesión activa — email del usuario */}
          <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {user.email}
          </div>

          {/* Logout */}
          <form action={logoutAction.bind(null, slug)}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm text-red-600 dark:text-red-400 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </nav>
      </aside>

      {/* Contenido de las páginas admin */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
