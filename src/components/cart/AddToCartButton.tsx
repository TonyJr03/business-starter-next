'use client'

/**
 * AddToCartButton — Client Component
 *
 * Botón "Agregar" que añade un producto al carrito.
 * Solo se muestra si el producto está disponible.
 * Pasa como `actionSlot` al ProductCard cuando el feature `cart` está activo.
 */

import { useCart } from '@/lib/cart/cart-context'
import type { Product } from '@/types'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const available = product.isAvailable ?? true

  if (!available) return null

  return (
    <button
      onClick={() => addItem(product)}
      className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
      aria-label={`Agregar ${product.name} al carrito`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-4 shrink-0"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Agregar
    </button>
  )
}
