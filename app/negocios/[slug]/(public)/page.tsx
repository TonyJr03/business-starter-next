import type { Metadata } from 'next'
import { resolveActiveSections } from '@/lib/modules/resolver'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { resolveBusinessBySlug } from '@/services'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantHomeProps {
  params: Promise<{ slug: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: TenantHomeProps): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  return {
    title: { absolute: business?.name ?? '' },
    description: business?.shortDescription,
    openGraph: {
      url: `/negocios/${slug}`,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TenantHome({ params }: TenantHomeProps) {
  const { slug } = await params

  // — tenant
  const business = await resolveBusinessBySlug(slug)

  // — datos
  const businessHours = business?.hours ?? []
  const businessWhatsapp = business?.contact?.whatsapp
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
