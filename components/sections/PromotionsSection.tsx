/**
 * PromotionsSection — Server Component
 *
 * Grid de promociones activas del negocio para la home.
 * Nombre alineado al id de config ('promotions').
 *
 * Las promociones se pasan como prop — el renderer las inyecta desde
 * promotions.service tras verificar que el section-module está activo.
 * El estado de cada promoción se calcula aquí antes de pasarlo a PromotionCard.
 */
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PromotionCard } from './PromotionCard'
import { getPromotionStatus } from '@/services'
import type { SectionModuleConfig } from '@/types'
import type { Promotion } from '@/types'

interface PromotionsSectionRenderProps extends Pick<SectionModuleConfig, 'title' | 'subtitle' | 'bg' | 'size'> {
  promotions: Promotion[]
}

export function PromotionsSection({
  title,
  subtitle,
  promotions,
  bg = 'default',
  size = 'md',
}: PromotionsSectionRenderProps) {
  if (!promotions.length) return null

  return (
    <Section bg={bg} size={size}>

      {title && (
        <SectionHeading title={title} subtitle={subtitle} className="mb-12 max-w-2xl mx-auto" />
      )}

      <ul className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promotion) => (
          <li key={promotion.id}>
            <PromotionCard
              promotion={promotion}
              status={getPromotionStatus(promotion)}
            />
          </li>
        ))}
      </ul>

    </Section>
  )
}
