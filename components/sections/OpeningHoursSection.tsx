/**
 * OpeningHoursSection — Server Component
 *
 * Tabla de horarios de atención del negocio.
 *
 * Los horarios se pasan como prop — el renderer los inyecta desde globalConfig.hours.
 */
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { HoursSectionProps, DayHours } from '@/types'

interface OpeningHoursSectionRenderProps extends HoursSectionProps {
  hours: DayHours[]
}

export function OpeningHoursSection({
  hours,
  title = 'Horarios',
  bg = 'default',
  size = 'md',
}: OpeningHoursSectionRenderProps) {
  return (
    <Section bg={bg} size={size}>
      <div className="max-w-lg mx-auto">

        <SectionHeading title={title} className="mb-8" />

        <ul
          className="rounded-xl overflow-hidden border divide-y"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.1))',
          }}
          aria-label="Horarios de atención"
        >
          {hours.map((entry) => (
            <li
              key={entry.day}
              className="flex justify-between items-center px-6 py-3.5"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                {entry.day}
              </span>
              {entry.isClosed ? (
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--color-error)' }}
                >
                  Cerrado
                </span>
              ) : (
                <span
                  className="text-sm tabular-nums"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {entry.open} – {entry.close}
                </span>
              )}
            </li>
          ))}
        </ul>

      </div>
    </Section>
  )
}
