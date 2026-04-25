/**
 * FaqSection — Server Component
 *
 * Lista de preguntas frecuentes con acordeón nativo (<details>/<summary>).
 * Sin JavaScript — interactividad gestionada por el navegador.
 * Soporta agrupación por categoría cuando los ítems tienen `category`.
 */
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { FaqItem } from '@/types'

interface FaqSectionProps {
  items: FaqItem[]
  title?: string
  subtitle?: string
  bg?: 'default' | 'surface' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export function FaqSection({
  items,
  title,
  subtitle,
  bg = 'default',
  size = 'md',
}: FaqSectionProps) {
  // Agrupar por categoría; sin categoría → clave ''
  const grouped = items.reduce<Record<string, FaqItem[]>>((acc, item) => {
    const key = item.category ?? ''
    ;(acc[key] ??= []).push(item)
    return acc
  }, {})

  const hasGroups = Object.keys(grouped).some((k) => k !== '')

  return (
    <Section bg={bg} size={size}>
      <div className="max-w-3xl mx-auto">

        {title && <SectionHeading title={title} subtitle={subtitle} />}

        <div className="space-y-10">
          {Object.entries(grouped).map(([category, groupItems]) => (
            <div key={category}>

              {hasGroups && category && (
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-4 pb-2 border-b"
                  style={{
                    color: 'var(--color-accent)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {category}
                </h3>
              )}

              <dl className="space-y-3">
                {groupItems.map((item) => (
                  <details
                    key={item.id}
                    className="group rounded-lg border overflow-hidden"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                    }}
                  >
                    <summary
                      className="flex items-center justify-between gap-4 cursor-pointer select-none px-5 py-4 text-base font-medium list-none"
                      style={{ color: 'var(--color-text)' }}
                    >
                      <dt>{item.question}</dt>
                      {/* Chevron — rota al abrirse via CSS group-open */}
                      <span
                        className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                        aria-hidden="true"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="5 8 10 13 15 8" />
                        </svg>
                      </span>
                    </summary>

                    <dd
                      className="px-5 pb-5 pt-1 text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {item.answer}
                    </dd>
                  </details>
                ))}
              </dl>

            </div>
          ))}
        </div>

      </div>
    </Section>
  )
}
