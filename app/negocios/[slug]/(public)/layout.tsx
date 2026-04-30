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
import { resolveBusinessBySlug } from '@/services/business.service'
import { getCatalogs } from '@/services/catalog.service'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import type { ReactNode } from 'react'

interface Props {
  params: Promise<{ slug: string }>
  children: ReactNode
}

export default async function PublicLayout({ params, children }: Props) {
  const { slug } = await params
  const [business, catalogs] = await Promise.all([
    resolveBusinessBySlug(slug),
    getCatalogs(),
  ])
  if (!business) notFound()

  return (
    <>
      <Header business={business} slug={slug} catalogs={catalogs} />
      <main className="flex-1">
        {children}
      </main>
      <Footer business={business} slug={slug} />
    </>
  )
}
