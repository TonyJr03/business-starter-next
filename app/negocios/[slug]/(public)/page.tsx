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
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { resolveBusinessBySlug } from '@/services/business.service'

interface TenantHomeProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TenantHomeProps): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)
  const { identity, seoDefaults } = globalConfig

  const name = business?.name ?? identity.name

  return {
    // title.absolute omite el template del tenant layout — en la home
    // la marca va primero seguida del tagline, no al revés.
    title: { absolute: `${name} · ${identity.tagline}` },
    description: seoDefaults.defaultDescription,
    openGraph: {
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
        <SectionRenderer key={section.id} section={section} hours={business?.hours ?? null} />
      ))}
    </>
  )
}
