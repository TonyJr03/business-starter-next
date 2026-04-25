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
import { resolveBusinessBySlug } from '@/services/business.service'
import { notFound } from 'next/navigation'
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

  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Sidebar admin */}
      <aside className="w-64 shrink-0 bg-zinc-900 flex flex-col sticky top-0 h-screen overflow-hidden">
        <AdminNav
          slug={slug}
          businessName={business.name}
          userEmail={user.email}
          logoutAction={logoutAction.bind(null, slug)}
        />
      </aside>

      {/* Contenido de las páginas admin */}
      <main className="flex-1 min-w-0 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
