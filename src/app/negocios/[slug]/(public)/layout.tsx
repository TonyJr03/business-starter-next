/**
 * Layout de las rutas públicas del tenant.
 *
 * Añade Header y Footer al árbol de rutas públicas.
 * `resolveBusinessBySlug` usa `cache()` de React, por lo que
 * la llamada en TenantLayout ya está memoizada — esta no genera
 * una segunda consulta a la base de datos.
 *
 * Los catálogos se cargan en paralelo con el negocio para que el Header
 * pueda construir el dropdown de multi-catálogo.
 */
import { notFound } from 'next/navigation'
import { resolveBusinessBySlug, getCatalogs } from '@/services'
import { resolveFeatureModule } from '@/lib/modules/resolver'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { CartShell } from '@/components/cart/CartShell'
import type { ReactNode } from 'react'

interface Props {
  params: Promise<{ slug: string }>
  children: ReactNode
}

export default async function PublicLayout({ params, children }: Props) {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)
  if (!business || !business.isActive) notFound()
  const catalogs = await getCatalogs(business.id)

  const cartFeature = resolveFeatureModule(business, 'cart')
  const whatsappOrdering = resolveFeatureModule(business, 'whatsappOrdering')

  return (
    <>
      <Header business={business} slug={slug} catalogs={catalogs} />
      <CartShell
        cartEnabled={cartFeature.enabled}
        canOrder={whatsappOrdering.enabled}
        whatsapp={business.contact?.whatsapp}
        businessName={business.name}
        businessId={business.id}
      >
        <main className="flex-1">
          {children}
        </main>
      </CartShell>
      <Footer business={business} slug={slug} />
    </>
  )
}
