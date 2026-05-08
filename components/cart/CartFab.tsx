'use client'

/**
 * CartFab — Client Component
 *
 * Botón flotante del carrito. Solo visible cuando hay al menos un ítem.
 * Posicionado en la esquina inferior derecha, por encima del contenido.
 * Abre el CartDrawer al pulsarlo.
 */

import { useCart } from '@/lib/cart/cart-context'

export function CartFab() {
  const { toggleCart, totalItems } = useCart()

  if (totalItems === 0) return null

  return (
    <button
      onClick={toggleCart}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      }}
      aria-label={`Ver carrito (${totalItems} ${totalItems === 1 ? 'ítem' : 'ítems'})`}
    >
      {/* Icono carrito */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-5 shrink-0"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>

      {/* Conteo */}
      <span className="text-sm font-bold tabular-nums">
        {totalItems > 99 ? '99+' : totalItems}
      </span>
    </button>
  )
}
