/**
 * Layout del área admin
 *
 * Rutas protegidas:
 * - /negocios/[slug]/admin
 * - /negocios/[slug]/admin/*
 *
 * Responsabilidades:
 * 1. Verifica sesión + membresía con getAdminContext() (una sola consulta a DB)
 *    → redirige a /negocios/[slug]/admin/login si no hay sesión
 *    → notFound() si el usuario no es admin de este negocio
 * 2. Proporciona la estructura visual del área admin
 *
 * Capas de protección:
 * - proxy.ts: guard optimista (cookie) — primera línea rápida
 * - Este layout: guard seguro (network) — verifica rol antes del render
 * - Páginas individuales: getAdminContext() — tercera línea en cada página
 */

import { redirect, notFound, forbidden } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { resolveBusinessBySlug } from '@/services'
import { resolveModules } from '@/lib/modules/resolver'
import { logoutAction } from '@/actions/auth'
import { AdminNav } from '@/components/admin/AdminNav'
import type { ReactNode } from 'react'

interface AdminLayoutProps {
  params: Promise<{ slug: string }>
  children: ReactNode
}

export default async function AdminLayout({ params, children }: AdminLayoutProps) {
  const { slug } = await params

  // Guard seguro: una sola consulta verifica sesión + negocio + membresía.
  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) {
    if (ctxResult.error === 'No autenticado') redirect(`/negocios/${slug}/admin/login`)
    if (ctxResult.error === 'No autorizado') forbidden()
    // Negocio no encontrado → 404 (el recurso genuinamente no existe)
    notFound()
  }
  const { ctx } = ctxResult

  const business = await resolveBusinessBySlug(slug)
  const { pages } = resolveModules(business)
  const enabledPages: Record<string, boolean> = Object.fromEntries(
    Object.entries(pages).map(([k, v]) => [k, v.enabled])
  )

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Sidebar admin */}
      <aside className="w-64 shrink-0 bg-zinc-900 flex flex-col sticky top-0 h-screen overflow-hidden">
        <AdminNav
          slug={slug}
          businessName={ctx.businessName}
          userEmail={ctx.userEmail}
          logoutAction={logoutAction.bind(null, slug)}
          enabledPages={enabledPages}
        />
      </aside>

      {/* Contenido de las páginas admin */}
      <main className="flex-1 min-w-0 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
