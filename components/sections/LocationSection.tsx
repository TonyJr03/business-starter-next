/**
 * LocationSection — Server Component
 *
 * Muestra la dirección del negocio y, si está disponible, un mapa embed.
 * Nombre alineado al id de config ('location').
 *
 * Los datos se pasan como prop desde business.location —
 * el renderer los inyecta directamente desde el objeto business.
 * No requiere fetch adicional: los datos vienen de la tabla businesses.
 */
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { SectionModuleConfig, SectionLayout, BusinessLocation } from '@/types'

interface LocationSectionRenderProps extends Pick<SectionModuleConfig, 'title'> {
  layout?: SectionLayout
  location: BusinessLocation
}

export function LocationSection({
  title,
  location,
  layout,
}: LocationSectionRenderProps) {
  const { bg = 'surface', size = 'md' } = layout ?? {}
  const displayAddress = location.address
    ?? [location.street, location.municipality, location.city].filter(Boolean).join(', ')

  return (
    <Section bg={bg} size={size}>
      <div className="max-w-2xl mx-auto flex flex-col gap-8">

        {title && (
          <SectionHeading title={title} className="text-center" />
        )}

        {displayAddress && (
          <p
            className="text-center text-base"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {displayAddress}
          </p>
        )}

        {location.mapUrl && (
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            <iframe
              src={location.mapUrl}
              title="Ubicación del negocio"
              width="100%"
              height="320"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

      </div>
    </Section>
  )
}
