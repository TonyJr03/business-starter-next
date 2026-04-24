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
 */

import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { logoutAction } from '@/actions/auth'
import { AdminNav } from '@/components/admin/AdminNav'
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
      {/* Sidebar admin */}
      <aside className="w-52 shrink-0 border-r border-zinc-200 dark:border-zinc-800 pr-6">
        <AdminNav
          slug={slug}
          userEmail={user.email}
          logoutAction={logoutAction.bind(null, slug)}
        />
      </aside>

      {/* Contenido de las páginas admin */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
