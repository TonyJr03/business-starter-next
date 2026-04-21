/**
 * Layout del área admin
 *
 * Rutas protegidas:
 * - /negocios/[slug]/admin
 * - /negocios/[slug]/admin/*
 *
 * Responsabilidades:
 * - Verifica que hay sesión (proxy.ts redirige a login si no)
 * - Proporciona sidebar/navegación básica del admin
 * - Define estructura visual del admin
 *
 * Nota: la verificación más estricta de sesión ocurre en proxy.ts.
 * Este layout es un punto adicional de claridad.
 */

import type { ReactNode } from 'react'

interface AdminLayoutProps {
  params: Promise<{ slug: string }>
  children: ReactNode
}

export default async function AdminLayout({ params, children }: AdminLayoutProps) {
  const { slug } = await params

  return (
    <div className="flex gap-6">
      {/* Sidebar admin */}
      <aside className="w-48 border-r border-zinc-200 dark:border-zinc-800 pr-6">
        <nav className="space-y-2">
          <h3 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Administración
          </h3>
          <a
            href={`/negocios/${slug}/admin`}
            className="block px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm"
          >
            Dashboard
          </a>
          <a
            href={`/negocios/${slug}/login`}
            className="block px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm text-red-600 dark:text-red-400"
          >
            Logout (M4)
          </a>
        </nav>
      </aside>

      {/* Contenido admin */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
