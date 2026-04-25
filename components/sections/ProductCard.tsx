/**
 * ProductCard — Server Component
 *
 * Tarjeta de producto para el catálogo / menú.
 * Muestra nombre, descripción, precio, badge y estado de disponibilidad.
 *
 * La acción de pedido se pasa como `orderHref` (enlace WhatsApp actual).
 * Cuando el módulo de carrito esté activo, el consumidor no pasará `orderHref`
 * y el slot de acción quedará vacío.
 */
import type { Product } from '@/types'

const badgeLabels: Record<string, string> = {
  new:     'Nuevo',
  popular: 'Popular',
  offer:   'Oferta',
}

interface ProductCardProps {
  product: Product
  orderHref?: string
}

export function ProductCard({ product, orderHref }: ProductCardProps) {
  const { name, description, money, badge, isAvailable, isFeatured } = product

  // Ausencia de isAvailable → disponible (regla de dominio)
  const available = isAvailable ?? true
  const displayPrice = `${money.amount} ${money.currency}`

  return (
    <div
      className="flex flex-col h-full rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: isFeatured
          ? 'var(--shadow-card-elevated, 0 4px 12px rgba(0,0,0,0.1))'
          : 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.06))',
      }}
    >
      <div className="flex flex-col gap-3 p-5 h-full">

        {/* Nombre + badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-semibold leading-snug"
              style={{
                color: 'var(--color-text)',
                textDecoration: !available ? 'line-through' : 'none',
                opacity: !available ? 0.4 : 1,
              }}
            >
              {name}
            </span>
            {badge && available && (
              <span
                className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                {badgeLabels[badge] ?? badge}
              </span>
            )}
            {!available && (
              <span
                className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-error, #ef4444)',
                  color: 'white',
                }}
              >
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Descripción */}
        {description && (
          <p
            className="text-sm leading-relaxed flex-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {description}
          </p>
        )}

        {/* Pie: precio + acción */}
        <div className="flex items-center justify-between gap-4 pt-1 mt-auto">
          <span
            className="text-lg font-bold tabular-nums"
            style={{
              color: 'var(--color-primary)',
              opacity: !available ? 0.4 : 1,
            }}
          >
            {displayPrice}
          </span>

          {orderHref && available && (
            <a
              href={orderHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: '#25D366', color: 'white' }}
              aria-label={`Pedir ${name} por WhatsApp`}
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
              Pedir
            </a>
          )}
        </div>

      </div>
    </div>
  )
}
