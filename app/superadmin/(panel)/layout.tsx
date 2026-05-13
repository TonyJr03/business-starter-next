/**
 * Layout del área superadmin
 *
 * Rutas protegidas:
 * - /superadmin
 * - /superadmin/*
 *
 * Responsabilidades:
 * 1. Verifica sesión y rol superadmin con isSuperAdmin() (verificación segura)
 *    → redirige a /superadmin/login si no hay sesión
 *    → devuelve 404 si la sesión existe pero no tiene rol superadmin
 * 2. Proporciona la estructura visual del área superadmin
 *
 * Capas de protección:
 * - proxy.ts: guard optimista (cookie) — primera línea rápida
 * - Este layout: guard seguro (network) — verifica rol antes del render
 */

import { redirect, notFound } from 'next/navigation'
import { isAuthenticated, isSuperAdmin } from '@/lib/auth'
import { superadminLogoutAction } from '@/actions/auth'
import { SuperAdminNav } from '@/components/superadmin/SuperAdminNav'
import type { ReactNode } from 'react'

interface SuperAdminLayoutProps {
  children: ReactNode
}

export default async function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  // Guard seguro: primero sesión, luego rol
  if (!(await isAuthenticated())) {
    redirect('/superadmin/login')
  }

  if (!(await isSuperAdmin())) {
    // Sesión válida pero sin rol de plataforma → 404 (no revela la existencia del área)
    notFound()
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
