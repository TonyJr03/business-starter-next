/**
 * Layout del área superadmin
 *
 * Rutas protegidas:
 * - /superadmin
 * - /superadmin/*
 *
 * Responsabilidades:
 * 1. Verifica sesión y rol con getSuperAdminContext() (una sola consulta a DB)
 *    → redirige a /superadmin/login si no hay sesión
 *    → notFound() si la sesión existe pero no tiene rol de plataforma
 * 2. Proporciona la estructura visual del área superadmin
 *
 * Capas de protección:
 * - proxy.ts: guard optimista (cookie) — primera línea rápida
 * - Este layout: guard seguro (network) — verifica rol antes del render
 * - Páginas individuales: getSuperAdminContext() — tercera línea en cada página
 */

import { redirect, forbidden } from 'next/navigation'
import { getSuperAdminContext } from '@/lib/admin'
import { superadminLogoutAction } from '@/actions/auth'
import { SuperAdminNav } from '@/components/superadmin/SuperAdminNav'
import type { ReactNode } from 'react'

interface SuperAdminLayoutProps {
  children: ReactNode
}

export default async function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  // Guard seguro: una sola consulta verifica sesión + rol juntos.
  const ctxResult = await getSuperAdminContext()
  if (!ctxResult.ok) {
    if (ctxResult.error === 'No autenticado') redirect('/superadmin/login')
    // Sesión válida pero sin rol de plataforma → 403 Acceso denegado
    forbidden()
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-zinc-900 flex flex-col sticky top-0 h-screen overflow-hidden">
        <SuperAdminNav logoutAction={superadminLogoutAction} />
      </aside>

      {/* Contenido */}
      <main className="flex-1 min-w-0 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
