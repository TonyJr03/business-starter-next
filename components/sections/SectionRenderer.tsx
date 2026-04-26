/**
 * SectionRenderer — Server Component
 *
 * Dispatcher genérico de section modules.
 * Recibe una entrada de configuración tipada (SectionModuleEntry) y renderiza
 * el componente correspondiente.
 *
 * Diseñado como herramienta general del sistema modular: puede usarse
 * tanto en la home del tenant como en cualquier otra página que renderice
 * una lista de SectionModuleEntry.
 *
 * El renderer es una función pura respecto a la configuración del negocio:
 * recibe todos los datos que necesita como props; no importa `globalConfig`.
 *
 * Secciones implementadas:
 *   - hero         → HeroSection
 *   - highlights   → HighlightsSection (+ highlightItems de data/)
 *   - hours        → OpeningHoursSection (usa `hours` prop directamente)
 *   - whatsapp_cta → CtaWhatsappSection (renderiza solo si `whatsapp` es válido)
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

import { highlightItems } from '@/data'
import type { SectionModuleEntry } from '@/types'
import type { DayHours } from '@/types'

interface SectionRendererProps {
  section: SectionModuleEntry
  /** Horarios del negocio. El caller resuelve el fallback base + override. */
  hours: DayHours[]
  /** Número de WhatsApp del negocio. Si está ausente, `whatsapp_cta` se omite. */
  whatsapp?: string
}

export function SectionRenderer({ section, hours, whatsapp }: SectionRendererProps) {
  if (!section.enabled) return null

  switch (section.id) {
    case 'hero':
      return <HeroSection {...section.props} />

    case 'highlights':
      return <HighlightsSection {...section.props} items={highlightItems} />

    case 'hours': {
      if (!hours.length) return null
      return <OpeningHoursSection {...section.props} hours={hours} />
    }

    case 'whatsapp_cta':
      if (!whatsapp) return null
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
