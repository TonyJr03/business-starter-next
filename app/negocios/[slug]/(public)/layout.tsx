import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import type { ReactNode } from 'react'
import type { BusinessSettings } from '@/lib/persistence'

interface PublicLayoutProps {
  /** business y slug vienen del layout padre (TenantLayout) via context */
  children: ReactNode
}

/**
 * Layout de las rutas públicas del tenant.
 * Se anida dentro de TenantLayout, que ya resolvió el negocio
 * y aplicó el branding. Aquí solo añadimos la cabecera y el pie
 * del sitio público.
 *
 * Nota: TenantLayout inyecta business y slug como props al layout
 * hijo directamente. Sin embargo, en Next.js App Router los layouts
 * no se pasan props entre sí — hay que resolver de nuevo o usar un
 * patrón diferente. Resolvemos el negocio aquí también (se cachea
 * automáticamente por React en el mismo request gracias a fetch).
 */
import { notFound } from 'next/navigation'
import { resolveBusinessBySlug } from '@/lib/tenant'

interface Props {
  params: Promise<{ slug: string }>
  children: ReactNode
}

export default async function PublicLayout({ params, children }: Props) {
  const { slug } = await params
  const business: BusinessSettings | null = await resolveBusinessBySlug(slug)
  if (!business) notFound()

  return (
    <>
      <Header business={business} slug={slug} />
      <main className="flex-1">
        {children}
      </main>
      <Footer business={business} slug={slug} />
    </>
  )
}
