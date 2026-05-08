'use client'

/**
 * CartContext — estado global del carrito (client-side only).
 *
 * El estado vive en memoria mientras la sesión del usuario esté activa.
 * CartProvider debe envolverse como ancestro de AddToCartButton, CartFab
 * y CartDrawer para que todos compartan la misma instancia de estado.
 */

import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { CartItem, Product } from '@/types'

// ─── Interfaz del contexto ────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[]
  isOpen: boolean
  /** Número total de unidades en el carrito. */
  totalItems: number
  /** Suma del precio de todos los ítems × cantidad. */
  totalPrice: number
  /** Código de divisa del primer ítem (asume divisa única por negocio). */
  currency: string
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  /** Incrementa o decrementa la cantidad. Si llega a 0, elimina el ítem. */
  updateQuantity: (productId: string, delta: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
        return next
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((p) => !p), [])

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)
  const currency = items[0]?.product.money.currency ?? ''
  const totalPrice = items.reduce(
    (acc, i) => acc + i.product.money.amount * i.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        totalItems,
        totalPrice,
        currency,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
