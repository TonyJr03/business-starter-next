import type { Metadata } from 'next'
import { resolveActiveSections } from '@/lib/modules/resolver'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { HeroSection } from '@/components/sections/HeroSection'
import { resolveBusinessBySlug, getAboutContent, getActivePromotions } from '@/services'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantHomeProps {
  params: Promise<{ slug: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: TenantHomeProps): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  if (!business || !business.isActive) {
    return { robots: { index: false, follow: false } }
  }

  return {
    title: { absolute: business.name },
    description: business.shortDescription,
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

  // — secciones activas (resueltas con dependencias verificadas)
  const activeSections = resolveActiveSections(business)
  const activeIds = new Set(activeSections.map(s => s.id))

  // — datos para section-modules (fetch condicional: solo si la sección está activa)
  const [about, promotions] = await Promise.all([
    activeIds.has('highlights') && business ? getAboutContent(business.id) : Promise.resolve(undefined),
    activeIds.has('promotions') && business ? getActivePromotions(business.id) : Promise.resolve([]),
  ])

  // — highlights: diferenciadores del módulo about (sin fetch adicional si about ya fue cargado)
  const highlights = about?.differentiators ?? []

  // — datos derivados de business (sin fetch adicional)
  const hours    = business?.hours ?? []
  const whatsapp = business?.contact?.whatsapp
  const location = business?.location

  // — ruta base para CTAs del hero
  const basePath = `/negocios/${slug}`

  return (
    <>
      {/* Hero — UI de layout fijo, instanciado directamente con datos del tenant */}
      <HeroSection
        title={business?.name ?? ''}
        tagline={undefined}
        subtitle={business?.shortDescription}
        primaryCta={{ label: 'Ver catálogo', href: `${basePath}/catalog` }}
        secondaryCta={{ label: 'Contáctanos', href: `${basePath}/contact` }}
        bg="secondary"
        size="lg"
      />

      {/* Section modules activos según configuración del tenant */}
      {activeSections.map(section => (
        <SectionRenderer
          key={section.id}
          section={section}
          highlights={highlights}
          promotions={promotions}
          hours={hours}
          whatsapp={whatsapp}
          location={location}
        />
      ))}
    </>
  )
}
