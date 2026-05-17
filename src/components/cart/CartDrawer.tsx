'use client'

/**
 * CartDrawer — Client Component
 *
 * Panel lateral deslizable que muestra los ítems del carrito,
 * controles de cantidad y el botón para pedir todo por WhatsApp.
 *
 * Props:
 *   canOrder    — `whatsappOrdering.enabled`: controla si se muestra el botón de pedido.
 *   whatsapp    — número del negocio en formato E.164.
 *   businessName — nombre del negocio para el mensaje pre-cargado.
 */

import { useCart } from '@/lib/cart/cart-context'
import { getWhatsAppUrl } from '@/lib/whatsapp'

interface CartDrawerProps {
  canOrder: boolean
  whatsapp?: string
  businessName: string
}

export function CartDrawer({ canOrder, whatsapp, businessName }: CartDrawerProps) {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    currency,
  } = useCart()

  if (!isOpen) return null

  // Construye el mensaje pre-cargado con el listado completo del pedido
  function buildOrderMessage(): string {
    const lines = items.map(
      (i) =>
        `- ${i.quantity}x ${i.product.name} (${i.product.money.amount * i.quantity} ${i.product.money.currency})`
    )
    return [
      `Hola ${businessName}, quisiera hacer el siguiente pedido:`,
      '',
      ...lines,
      '',
      `Total: ${totalPrice} ${currency}`,
    ].join('\n')
  }

  const orderUrl = canOrder ? getWhatsAppUrl(buildOrderMessage(), whatsapp) : undefined

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col shadow-xl"
        style={{ backgroundColor: 'var(--color-bg)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* ── Encabezado ── */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            Carrito
            {totalItems > 0 && (
              <span
                className="ml-2 text-sm font-normal"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ({totalItems} {totalItems === 1 ? 'ítem' : 'ítems'})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-md transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-2"
            aria-label="Cerrar carrito"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Lista de ítems ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="size-16 opacity-30"
                style={{ color: 'var(--color-text-subtle)' }}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Tu carrito está vacío.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-start gap-3 py-4">
                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-2 mt-0.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center text-base font-bold transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                      aria-label={`Reducir cantidad de ${product.name}`}
                    >
                      −
                    </button>
                    <span
                      className="w-5 text-center text-sm font-semibold tabular-nums"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center text-base font-bold transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                      aria-label={`Aumentar cantidad de ${product.name}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Nombre y precio unitario */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold leading-snug"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {product.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {product.money.amount} {product.money.currency} c/u
                    </p>
                  </div>

                  {/* Subtotal + quitar */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {product.money.amount * quantity} {product.money.currency}
                    </span>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-xs transition-opacity hover:opacity-70 focus-visible:outline-none"
                      style={{ color: 'var(--color-text-subtle)' }}
                      aria-label={`Quitar ${product.name} del carrito`}
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Pie: total + acciones ── */}
        {items.length > 0 && (
          <div
            className="px-5 py-4 border-t flex flex-col gap-3 shrink-0"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Total
              </span>
              <span
                className="text-xl font-bold tabular-nums"
                style={{ color: 'var(--color-primary)' }}
              >
                {totalPrice} {currency}
              </span>
            </div>

            {/* Botón pedir por WhatsApp */}
            {orderUrl ? (
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75.75 0 0 0 .915.915l5.573-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 0 1-4.953-1.36l-.355-.212-3.683.972.985-3.595-.231-.37A9.694 9.694 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                </svg>
                Pedir todo por WhatsApp
              </a>
            ) : canOrder && !whatsapp ? (
              <p className="text-xs text-center" style={{ color: 'var(--color-text-subtle)' }}>
                Configura el número de WhatsApp del negocio para habilitar pedidos.
              </p>
            ) : null}

            {/* Vaciar carrito */}
            <button
              onClick={clearCart}
              className="text-xs text-center transition-opacity hover:opacity-70 focus-visible:outline-none"
              style={{ color: 'var(--color-text-subtle)' }}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}
