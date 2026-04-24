/**
 * HomeSectionRenderer — Server Component
 *
 * Dispatcher de secciones para la Home.
 * Recibe una entrada de configuración tipada (SectionModuleEntry) y renderiza
 * el componente correspondiente.
 *
 * Equivalente de HomeSectionRenderer.astro.
 *
 * Secciones implementadas en M5:
 *   - hero         → HeroSection
 *   - highlights   → HighlightsSection (+ homeFeatures de data/)
 *   - hours        → OpeningHoursSection (+ globalConfig.hours)
 *   - whatsapp_cta → CtaWhatsappSection
 *
 * Secciones pendientes (M6+):
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
import { CtaWhatsappSection } from './CtaWhatsappSection'

import { globalConfig } from '@/config'
import { homeFeatures } from '@/data'
import type { SectionModuleEntry } from '@/types/section-modules'
import type { DayHours } from '@/types'

interface HomeSectionRendererProps {
  section: SectionModuleEntry
  hours?: DayHours[] | null
}

export function HomeSectionRenderer({ section, hours }: HomeSectionRendererProps) {
  if (!section.enabled) return null

  switch (section.id) {
    case 'hero':
      return <HeroSection {...section.props} />

    case 'highlights':
      return <HighlightsSection {...section.props} items={homeFeatures} />

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
