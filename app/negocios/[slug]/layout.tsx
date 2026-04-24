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
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import type { ReactNode } from 'react'
import type { BusinessSettings } from '@/lib/persistence'

interface TenantLayoutProps {
  params: Promise<{ slug: string }>
  children: ReactNode
}

/** Construye el objeto de CSS custom properties de marca para el tenant. */
function buildBrandVars(branding: typeof globalConfig.branding): React.CSSProperties {
  const { colors = {}, typography = {} } = branding
  return {
    '--color-primary':           colors.primary         ?? '#6F4E37',
    '--color-secondary':         colors.secondary       ?? '#F5E6D3',
    '--color-accent':            colors.accent          ?? '#D4A574',
    '--color-footer-bg':         colors.footerBg        ?? '#111827',
    '--color-footer-text':       colors.footerText      ?? '#FFFFFF',
    '--color-footer-text-muted': colors.footerTextMuted ?? '#9CA3AF',
    '--color-footer-border':     colors.footerBorder    ?? '#1F2937',
    '--font-heading':            typography.heading     ?? "'Inter', system-ui, sans-serif",
    '--font-body':               typography.body        ?? "'Inter', system-ui, sans-serif",
  } as React.CSSProperties
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
  const brandVars = buildBrandVars(globalConfig.branding)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={brandVars}
      data-theme={globalConfig.branding.themeKey ?? 'default'}
    >
      <Header business={business} slug={slug} />

      <main className="flex-1">
        {children}
      </main>

      <Footer business={business} slug={slug} />
    </div>
  )
}