/**
 * Layout raíz del tenant — resuelve el negocio y aplica branding.
 *
 * Rutas cubiertas:
 * - /negocios/[slug]/(public)/*  → rutas públicas (Header+Footer via su propio layout)
 * - /negocios/[slug]/(admin)/*   → área admin (sidebar via su propio layout)
 *
 * Este layout SOLO se encarga de:
 * 1. Resolver el negocio por slug → 404 si no existe
 * 2. Aplicar el branding del negocio vía CSS custom properties
 *    Prioridad: business.branding (DB) → globalConfig.branding → BRAND_DEFAULTS
 * El Header y Footer viven en (public)/layout.tsx
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug } from '@/services/business.service'
import { globalConfig } from '@/config'
import { buildBrandVars, getThemeKey } from '@/lib/branding'
import type { ReactNode } from 'react'

interface TenantLayoutProps {
  params: Promise<{ slug: string }>
  children: ReactNode
}

/**
 * Metadata del tenant: establece el template de título y los datos base
 * de OpenGraph para todas las rutas hijas.
 *
 * Jerarquía de títulos:
 *   Root layout   → "%s | Business Starter"  (plataforma)
 *   Tenant layout → "%s · ${business.name}"  (sobreescribe para el subtree)
 *   Página        → "Catálogo"               (solo el nombre corto)
 *   Resultado     → "Catálogo · Café La Esquina"
 *
 * La home del tenant usa `title.absolute` para poner la marca primero.
 */
export async function generateMetadata({ params }: TenantLayoutProps): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  if (!business) return {}

  return {
    title: {
      template: `%s · ${business.name}`,
      default: business.name,
    },
    description: business.shortDescription,
    openGraph: {
      siteName: business.name,
    },
  }
}

export default async function TenantLayout({ params, children }: TenantLayoutProps) {
  const { slug } = await params

  const business = await resolveBusinessBySlug(slug)
  if (!business) {
    notFound()
  }

  // Branding: DB override por tenant > config estático del starter > defaults del sistema
  const brandVars = buildBrandVars(globalConfig.branding, business.branding)
  const themeKey = getThemeKey(globalConfig.branding, business.branding)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={brandVars}
      data-theme={themeKey}
    >
      {children}
    </div>
  )
}