/**
 * Home del tenant
 *
 * Ruta: /negocios/[slug]
 * Acceso: público
 *
 * Renderiza las secciones habilitadas de la home en el orden definido
 * en `globalConfig.modules.sections`.
 */

import type { Metadata } from 'next'
import { globalConfig } from '@/config'
import { HomeSectionRenderer } from '@/components/sections/HomeSectionRenderer'
import { resolveBusinessBySlug } from '@/lib/tenant'

interface TenantHomeProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TenantHomeProps): Promise<Metadata> {
  const { slug } = await params
  const { identity, seoDefaults } = globalConfig

  return {
    title: `${identity.name} · ${identity.tagline}`,
    description: seoDefaults.defaultDescription,
    openGraph: {
      title: `${identity.name} · ${identity.tagline}`,
      description: seoDefaults.defaultDescription ?? undefined,
      images: seoDefaults.ogImage ? [{ url: seoDefaults.ogImage }] : undefined,
      url: `/negocios/${slug}`,
    },
  }
}

export default async function TenantHome({ params }: TenantHomeProps) {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  const activeSections = globalConfig.modules.sections
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order)

  return (
    <>
      {activeSections.map(section => (
        <HomeSectionRenderer key={section.id} section={section} hours={business?.hours ?? null} />
      ))}
    </>
  )
}
