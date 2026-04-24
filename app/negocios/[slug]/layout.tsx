/**
 * Layout público del tenant — M5
 *
 * Rutas cubiertas:
 * - /negocios/[slug]           → home pública
 * - /negocios/[slug]/login     → login del negocio
 * - /negocios/[slug]/(admin)/* → área admin (protegida por proxy.ts)
 *
 * Responsabilidades:
 * 1. Resuelve el negocio por slug → 404 si no existe
 * 2. Aplica el branding base del negocio vía CSS custom properties
 * 3. Renderiza Header y Footer reales del tenant
 * 4. Proporciona la estructura base (header / main / footer) a todas las páginas hijas
 */

import { notFound } from 'next/navigation'
import { resolveBusinessBySlug } from '@/lib/tenant'
import { globalConfig } from '@/config'
import { buildBrandVars, getThemeKey } from '@/lib/branding'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
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
  // tenantOverride → pendiente M6+ (cuando DB tenga columnas de branding)
  const brandVars = buildBrandVars(globalConfig.branding)
  const themeKey = getThemeKey(globalConfig.branding)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={brandVars}
      data-theme={themeKey}
    >
      <Header business={business} slug={slug} />

      <main className="flex-1">
        {children}
      </main>

      <Footer business={business} slug={slug} />
    </div>
  )
}