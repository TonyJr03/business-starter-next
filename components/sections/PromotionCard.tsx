/**
 * PromotionCard — Server Component
 *
 * Tarjeta de promoción con estado visual derivado de fechas.
 * El estado se calcula en el consumidor y se pasa como prop —
 * el componente no tiene lógica de negocio.
 *
 * Estados:
 *  - 'active'   → promoción vigente (color de acento)
 *  - 'upcoming' → aún no comenzó (color info)
 *  - 'paused'   → en pausa temporal (color warning)
 *  - 'expired'  → venció o está inactiva (gris)
 *
 * Equivalente de PromotionCard.astro.
 */
import type { Promotion } from '@/types'

export type PromoStatus = 'active' | 'upcoming' | 'paused' | 'expired'

interface PromotionCardProps {
  promotion: Promotion
  status: PromoStatus
  dateRange?: string
  orderHref?: string
}

const statusBadge: Record<PromoStatus, { color: string; label: string }> = {
  active:   { color: '#16a34a', label: 'Vigente' },
  upcoming: { color: '#2563eb', label: 'Próximamente' },
  paused:   { color: '#d97706', label: 'En pausa' },
  expired:  { color: '#6b7280', label: 'Finalizada' },
}

export function PromotionCard({ promotion, status, dateRange, orderHref }: PromotionCardProps) {
  const { title, description, discountLabel } = promotion
  const badge = statusBadge[status]
  const isDimmed = status === 'expired' || status === 'paused'
  const isExpired = status === 'expired'
  const isElevated = status === 'active'

  return (
    <div
      className="flex flex-col h-full rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: isElevated ? 'var(--color-accent)' : 'var(--color-border)',
        boxShadow: isElevated
          ? 'var(--shadow-card-elevated, 0 4px 12px rgba(0,0,0,0.1))'
          : 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.06))',
      }}
    >
      <div className="flex flex-col gap-4 p-6 h-full">

        {/* Cabecera: título + badges */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <h2
              className="text-xl font-bold leading-snug"
              style={{
                color: 'var(--color-text)',
                opacity: isDimmed ? 0.5 : 1,
              }}
            >
              {title}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Badge de estado */}
              <span
                className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: badge.color }}
              >
                {badge.label}
              </span>
              {/* Etiqueta de descuento */}
              {discountLabel && !isExpired && (
                <span
                  className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  {discountLabel}
                </span>
              )}
            </div>
          </div>

          {/* Rango de fechas */}
          {dateRange && (
            <p
              className="text-xs shrink-0 mt-0.5"
              style={{ color: 'var(--color-text-subtle)' }}
            >
              {dateRange}
            </p>
          )}
        </div>

        {/* Descripción */}
        <p
          className="text-sm leading-relaxed flex-1"
          style={{
            color: 'var(--color-text-muted)',
            opacity: isDimmed ? 0.5 : 1,
          }}
        >
          {description}
        </p>

        {/* CTA — solo si vigente y hay número */}
        {status === 'active' && orderHref && (
          <div className="pt-1 mt-auto">
            <a
              href={orderHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: '#25D366' }}
              aria-label={`Aprovechar promoción: ${title}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75.75 0 0 0 .915.915l5.573-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 0 1-4.953-1.36l-.355-.212-3.683.972.985-3.595-.231-.37A9.694 9.694 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
              </svg>
              Aprovechar oferta
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
