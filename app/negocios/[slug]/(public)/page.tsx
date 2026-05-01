/**
 * Home del tenant
 *
 * Ruta: /negocios/[slug]
 * Acceso: público
 *
 * Renderiza las secciones habilitadas de la home en el orden definido
 * por el resolver modular. La lista de secciones activas se obtiene via
 * `resolveActiveSections(business)` — seam point para overrides por tenant en S4.
 */

import type { Metadata } from 'next'
import { resolveActiveSections } from '@/lib/modules/resolver'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { resolveBusinessBySlug } from '@/services'

interface TenantHomeProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TenantHomeProps): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  return {
    // title.absolute omite el template del tenant layout — en la home
    // la marca va primero.
    title: { absolute: business?.name ?? '' },
    description: business?.shortDescription,
    openGraph: {
      url: `/negocios/${slug}`,
    },
  }
}

export default async function TenantHome({ params }: TenantHomeProps) {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  // Datos del negocio desde BD. Si no existen, se pasa vacío —
  // cada sección decide si se muestra o no.
  const businessHours = business?.hours ?? []
  const businessWhatsapp = business?.whatsapp

  const activeSections = resolveActiveSections(business)

  return (
    <>
      {activeSections.map(section => (
        <SectionRenderer
          key={section.id}
          section={section}
          hours={businessHours}
          whatsapp={businessWhatsapp}
        />
      ))}
    </>
  )
}
