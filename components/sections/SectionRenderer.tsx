/**
 * SectionRenderer — Server Component
 *
 * Dispatcher genérico de section modules.
 * Recibe una entrada de configuración tipada (SectionModuleEntry) y renderiza
 * el componente correspondiente.
 *
 * Uso primario: home del tenant. Diseñado para ser reutilizable en cualquier
 * página que renderice una lista de SectionModuleEntry.
 *
 * Secciones implementadas:
 *   - hero         → HeroSection
 *   - highlights   → HighlightsSection (+ highlightItems de data/)
 *   - hours        → OpeningHoursSection (+ globalConfig.hours)
 *   - whatsapp_cta → CtaWhatsappSection (feature transversal)
 *
 * Secciones pendientes:
 *   - promotions, testimonials, location → se omiten silenciosamente
 *
 * Para añadir una sección nueva:
 *   1. Implementar el componente en components/sections/.
 *   2. Importarlo aquí.
 *   3. Añadir la rama correspondiente abajo.
 */
import { HeroSection } from './HeroSection'
import { HighlightsSection } from './HighlightsSection'
import { OpeningHoursSection } from './OpeningHoursSection'
import { CtaWhatsappSection } from '@/components/features/CtaWhatsappSection'

import { globalConfig } from '@/config'
import { highlightItems } from '@/data'
import type { SectionModuleEntry } from '@/types'
import type { DayHours } from '@/types'

interface SectionRendererProps {
  section: SectionModuleEntry
  hours?: DayHours[] | null
}

export function SectionRenderer({ section, hours }: SectionRendererProps) {
  if (!section.enabled) return null

  switch (section.id) {
    case 'hero':
      return <HeroSection {...section.props} />

    case 'highlights':
      return <HighlightsSection {...section.props} items={highlightItems} />

    case 'hours': {
      const effectiveHours = (hours && hours.length > 0) ? hours : globalConfig.hours
      if (!effectiveHours.length) return null
      return <OpeningHoursSection {...section.props} hours={effectiveHours} />
    }

    case 'whatsapp_cta':
      if (!globalConfig.contact.whatsapp) return null
      return <CtaWhatsappSection {...section.props} />

    // Secciones no implementadas aún — se omiten silenciosamente
    case 'promotions':
    case 'testimonials':
    case 'location':
      return null

    default:
      return null
  }
}
