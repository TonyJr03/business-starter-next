'use client'

/**
 * CartShell — Client Component
 *
 * Wrapper que provee el CartContext a toda la subtree del layout público
 * y monta el CartDrawer cuando el feature `cart` está activo.
 *
 * Al ser un Client Component, puede recibir Server Components como `children`
 * sin romper el modelo de rendering de Next.js App Router.
 */

import { CartProvider } from '@/lib/cart/cart-context'
import { CartDrawer } from './CartDrawer'
import { CartFab } from './CartFab'
import type { ReactNode } from 'react'

interface CartShellProps {
  children: ReactNode
  /** `cart.enabled` — monta el drawer y activa la UI del carrito. */
  cartEnabled: boolean
  /** `whatsappOrdering.enabled` — habilita el botón de pedido en el drawer. */
  canOrder: boolean
  whatsapp?: string
  businessName: string
}

export function CartShell({
  children,
  cartEnabled,
  canOrder,
  whatsapp,
  businessName,
}: CartShellProps) {
  return (
    <CartProvider>
      {children}
      {cartEnabled && (
        <>
          <CartFab />
          <CartDrawer canOrder={canOrder} whatsapp={whatsapp} businessName={businessName} />
        </>
      )}
    </CartProvider>
  )
}
