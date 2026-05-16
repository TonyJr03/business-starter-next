'use client'

/**
 * CartContext — estado global del carrito (client-side only).
 *
 * Usa useSyncExternalStore para leer desde localStorage sin efectos
 * y sin causar hydration mismatch:
 *   - getServerSnapshot → siempre [] (servidor no conoce el carrito del usuario)
 *   - getSnapshot       → lee localStorage en el cliente
 *
 * La persistencia ocurre dentro de CartStore.setState(), no en un useEffect,
 * por lo que no hay setState síncrono en effects ni cascadas de renders.
 */

import { createContext, useContext, useState, useCallback, useRef, useSyncExternalStore } from 'react'
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

// ─── Cart Store ───────────────────────────────────────────────────────────────

/**
 * Tienda externa a React que actúa como fuente de verdad del carrito.
 * Sirve de puente entre useSyncExternalStore y localStorage:
 *   - Lee localStorage al inicializarse (solo en el cliente).
 *   - Persiste en localStorage en cada mutación.
 *   - Notifica a los suscriptores para que useSyncExternalStore re-renderice.
 */
interface CartStoreInstance {
  getState: () => CartItem[]
  setState: (updater: (prev: CartItem[]) => CartItem[]) => void
  subscribe: (cb: () => void) => () => void
}

function createCartStore(storageKey: string | undefined): CartStoreInstance {
  let state: CartItem[] = []

  // Inicialización desde localStorage (solo en el cliente)
  if (typeof window !== 'undefined' && storageKey) {
    try {
      const raw = localStorage.getItem(`cart:${storageKey}`)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) state = parsed as CartItem[]
      }
    } catch { /* storage no disponible o datos corruptos */ }
  }

  const subscribers = new Set<() => void>()
  const notify = () => subscribers.forEach((cb) => cb())

  return {
    getState: () => state,
    setState: (updater) => {
      state = updater(state)
      // Persistencia inline: se escribe en el mismo ciclo que la mutación
      if (storageKey) {
        try {
          if (state.length === 0) {
            localStorage.removeItem(`cart:${storageKey}`)
          } else {
            localStorage.setItem(`cart:${storageKey}`, JSON.stringify(state))
          }
        } catch { /* storage lleno u otro error — ignorar */ }
      }
      notify()
    },
    subscribe: (cb) => {
      subscribers.add(cb)
      return () => { subscribers.delete(cb) }
    },
  }
}

// Referencia estable para el snapshot del servidor (siempre carrito vacío)
const SERVER_SNAPSHOT: CartItem[] = []

// ─── Provider ─────────────────────────────────────────────────────────────────

interface CartProviderProps {
  children: ReactNode
  /** ID del negocio para aislar el carrito en localStorage (e.g. business.id). */
  storageKey?: string
}

export function CartProvider({ children, storageKey }: CartProviderProps) {
  // El store se crea UNA vez por instancia del provider.
  // useRef garantiza que la misma instancia sobrevive re-renders.
  const storeRef = useRef<CartStoreInstance | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createCartStore(storageKey)
  }
  const store = storeRef.current

  const items = useSyncExternalStore(
    (cb) => store.subscribe(cb),  // suscripción
    () => store.getState(),        // snapshot del cliente (lee localStorage)
    () => SERVER_SNAPSHOT,         // snapshot del servidor → siempre []
  )
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((product: Product) => {
    store.setState((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
        return next
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [store])

  const removeItem = useCallback((productId: string) => {
    store.setState((prev) => prev.filter((i) => i.product.id !== productId))
  }, [store])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    store.setState((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    )
  }, [store])

  const clearCart  = useCallback(() => store.setState(() => []), [store])
  const openCart   = useCallback(() => setIsOpen(true), [])
  const closeCart  = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((p) => !p), [])

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)
  const currency   = items[0]?.product.money.currency ?? ''
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
