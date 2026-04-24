/**
 * Layout raíz del tenant — resuelve el negocio y aplica branding.
 *
 * Rutas cubiertas:
 * - /negocios/[slug]/(public)/*  → rutas públicas (Header+Footer via su propio layout)
 * - /negocios/[slug]/(admin)/*   → área admin (sidebar via su propio layout)
 *
 * Este layout SOLO se encarga de:
 * 1. Resolver el negocio por slug → 404 si no existe
 * 2. Aplicar el branding base del negocio vía CSS custom properties
 * El Header y Footer viven en (public)/layout.tsx
 */

import { notFound } from 'next/navigation'
import { resolveBusinessBySlug } from '@/lib/tenant'
import { globalConfig } from '@/config'
import { buildBrandVars, getThemeKey } from '@/lib/branding'
import type { ReactNode } from 'react'

interface TenantLayoutProps {
  params: Promise<{ slug: string }>
  children: ReactNode
}

export default async function TenantLayout({ params, children }: TenantLayoutProps) {
  const { slug } = await params

  const business = await resolveBusinessBySlug(slug)
  if (!business) {
    notFound()
  }

  const brandVars = buildBrandVars(globalConfig.branding)
  const themeKey = getThemeKey(globalConfig.branding)

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