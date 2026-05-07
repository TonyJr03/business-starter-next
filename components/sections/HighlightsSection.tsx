/**
 * HighlightsSection — Server Component
 *
 * Grid de características / propuesta de valor del negocio.
 * Nombre alineado al id de config ('highlights').
 *
 * Los ítems se pasan como prop — el renderer los inyecta desde data/highlights.ts.
 */
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import type { SectionModuleConfig, ContentFeature } from '@/types'

interface HighlightsSectionRenderProps extends Pick<SectionModuleConfig, 'title' | 'subtitle' | 'columns' | 'bg' | 'size'> {
  items: ContentFeature[]
}

const gridClass: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function HighlightsSection({
  title,
  subtitle,
  items,
  columns = 3,
  bg = 'surface',
  size = 'md',
}: HighlightsSectionRenderProps) {
  return (
    <Section bg={bg} size={size}>

      {title && (
        <SectionHeading title={title} subtitle={subtitle} className="mb-12 max-w-2xl mx-auto" />
      )}

      <ul className={`grid gap-6 ${gridClass[columns ?? 3]}`}>
        {items.map((item) => (
          <li
            key={item.title}
            className="flex flex-col gap-3 rounded-lg p-6 bg-white"
            style={{ boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.1))' }}
          >
            {item.icon && (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-secondary)' }}
                aria-hidden="true"
              >
                <FeatureIcon icon={item.icon} />
              </div>
            )}
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--color-text)' }}
            >
              {item.title}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {item.description}
            </p>
          </li>
        ))}
      </ul>

    </Section>
  )
}
