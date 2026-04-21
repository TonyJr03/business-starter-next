/**
 * Layout del tenant
 *
 * Rutas:
 * - /negocios/[slug]
 * - /negocios/[slug]/login
 * - /negocios/[slug]/admin
 *
 * Responsabilidades:
 * - Lee el slug del header x-tenant-slug (propagado por proxy.ts)
 * - Resuelve los datos del negocio si hace falta
 * - Proporciona contexto básico para hijas
 */

import { notFound } from 'next/navigation'
import { resolveBusinessBySlug } from '@/lib/tenant'
import type { ReactNode } from 'react'

interface TenantLayoutProps {
  params: Promise<{ slug: string }>
  children: ReactNode
}

export default async function TenantLayout({ params, children }: TenantLayoutProps) {
  const { slug } = await params

  // Valida que el tenant existe
  const business = await resolveBusinessBySlug(slug)
  if (!business) {
    notFound()
  }

  return (
    <div>
      {/* Header básico del tenant */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold">{business.name}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{slug}</p>
        </div>
      </header>

      {/* Contenido de las rutas hijas */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
