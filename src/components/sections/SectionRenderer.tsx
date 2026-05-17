/**
 * SectionRenderer — Server Component
 *
 * Dispatcher genérico de section modules.
 * Recibe una entrada de configuración tipada (ResolvedSectionEntry) y renderiza
 * el componente correspondiente.
 *
 * Diseñado como herramienta general del sistema modular: puede usarse
 * tanto en la home del tenant como en cualquier otra página que renderice
 * secciones activas.
 *
 * El renderer es una función pura respecto a la configuración del negocio:
 * recibe todos los datos que necesita como props; no importa `globalConfig`.
 *
 * Secciones implementadas:
 *   - highlights   → HighlightsSection  (datos: highlights[])
 *   - promotions   → PromotionsSection  (datos: promotions[])
 *   - hours        → OpeningHoursSection (datos: hours[])
 *   - whatsapp_cta → CtaWhatsappSection  (datos: whatsapp)
 *   - location     → LocationSection    (datos: location)
 *
 * Para añadir una sección nueva:
 *   1. Implementar el componente en components/sections/.
 *   2. Importarlo aquí.
 *   3. Añadir la rama correspondiente abajo.
 *   4. Añadir la prop de datos en SectionRendererProps.
 *   5. Añadir el fetch condicional en page.tsx.
 */
import { HighlightsSection } from './HighlightsSection'
import { PromotionsSection } from './PromotionsSection'
import { OpeningHoursSection } from './OpeningHoursSection'
import { LocationSection } from './LocationSection'
import { CtaWhatsappSection } from '@/components/features/CtaWhatsappSection'

import type { ResolvedSectionEntry } from '@/types'
import type { ContentFeature, DayHours, BusinessLocation, Promotion } from '@/types'

interface SectionRendererProps {
  section: ResolvedSectionEntry
  /** Ítems de propuesta de valor. Requerido por 'highlights'. */
  highlights?: ContentFeature[]
  /** Promociones activas del negocio. Requerido por 'promotions'. */
  promotions?: Promotion[]
  /** Horarios de atención del negocio. Requerido por 'hours'. */
  hours?: DayHours[]
  /** Número de WhatsApp del negocio. Requerido por 'whatsapp_cta'. */
  whatsapp?: string
  /** Ubicación del negocio. Requerido por 'location'. */
  location?: BusinessLocation
}

export function SectionRenderer({
  section,
  highlights = [],
  promotions = [],
  hours = [],
  whatsapp,
  location,
}: SectionRendererProps) {
  if (!section.enabled) return null

  switch (section.id) {
    case 'highlights':
      return <HighlightsSection {...section} items={highlights} />

    case 'promotions':
      return <PromotionsSection {...section} promotions={promotions} />

    case 'hours': {
      if (!hours.length) return null
      return <OpeningHoursSection {...section} hours={hours} />
    }

    case 'whatsapp_cta':
      if (!whatsapp) return null
      return <CtaWhatsappSection {...section} phoneNumber={whatsapp} />

    case 'location':
      if (!location) return null
      return <LocationSection {...section} location={location} />

    default:
      return null
  }
}
