/**
 * Layout de la plataforma central.
 *
 * Cubre la ruta raíz `/` (y cualquier otra ruta bajo el grupo (platform)).
 *
 * Diferencias clave vs el layout del tenant:
 * - No resuelve negocio por slug ni inyecta CSS custom properties de marca
 * - Header y Footer propios de la plataforma (no los del tenant)
 * - Fondo neutro: zinc en lugar de la paleta cálida del negocio
 */

import type { ReactNode } from 'react'
import { PlatformHeader } from '@/components/platform/PlatformHeader'
import { PlatformFooter } from '@/components/platform/PlatformFooter'

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <PlatformHeader />
      <main className="flex-1">{children}</main>
      <PlatformFooter />
    </div>
  )
}
