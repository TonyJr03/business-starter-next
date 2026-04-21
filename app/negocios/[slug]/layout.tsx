/**
 * Layout del tenant
 *
 * Rutas cubiertas:
 * - /negocios/[slug]           → home pública
 * - /negocios/[slug]/login     → login del negocio
 * - /negocios/[slug]/(admin)/* → área admin (protegida por proxy.ts)
 *
 * Responsabilidades:
 * 1. Resuelve el negocio por slug → 404 si no existe
 * 2. Propaga el contexto del tenant a todas las páginas hijas
 *
 * TODO M5: reemplazar el header placeholder por MainLayout real.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { resolveBusinessBySlug } from '@/lib/tenant'
import type { ReactNode } from 'react'
import type { BusinessSettings } from '@/lib/persistence'

interface TenantLayoutProps {
  params: Promise<{ slug: string }>
  children: ReactNode
}

export default async function TenantLayout({ params, children }: TenantLayoutProps) {
  const { slug } = await params

  // Resolve tenant — notFound() lanza un error que Next.js captura
  // y muestra app/not-found.tsx. Nunca llega al return si es null.
  const business: BusinessSettings | null = await resolveBusinessBySlug(slug)
  if (!business) {
    notFound()
  }

  // A partir de aquí, business es BusinessSettings (nunca null)
  const locationLabel = [business.city, business.country].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen flex flex-col">
      {/*
       * ── Header placeholder (M3) ────────────────────────────────────────────
       * TODO M5: reemplazar por el componente Header real del negocio.
       */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          {/* Identidad del negocio */}
          <div>
            <Link
              href={`/negocios/${slug}`}
              className="text-xl font-semibold hover:opacity-80 transition-opacity"
            >
              {business.name}
            </Link>
            {(business.shortDescription || locationLabel) && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {business.shortDescription ?? locationLabel}
              </p>
            )}
          </div>

          {/* Accesos rápidos de desarrollo */}
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href={`/negocios/${slug}/admin`}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Admin
            </Link>
            <Link
              href={`/negocios/${slug}/login`}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/*
       * ── Contenido ──────────────────────────────────────────────────────────
       * TODO M5: ajustar padding/estructura cuando llegue el layout real.
       */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {children}
      </div>
    </div>
  )
}
