/**
 * Gallery — galería de imágenes del negocio
 *
 * Ruta: /negocios/[slug]/gallery
 * Acceso: público
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug } from '@/services/business.service'
import { resolvePageModule } from '@/lib/modules/resolver'
import { galleryItems } from '@/data'
import { GalleryGrid } from '@/components/sections/GalleryGrid'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  return {
    title: 'Galería',
    description: `Conoce el espacio, los productos y el equipo de ${business?.name ?? ''} a través de nuestra galería de imágenes.`,
    openGraph: {
      url: `/negocios/${slug}/gallery`,
    },
  }
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params

  const business = await resolveBusinessBySlug(slug)

  // Guarda de módulo — respeta overrides por tenant
  const galleryModule = resolvePageModule(business, 'gallery')
  if (!galleryModule.enabled) notFound()

  return (
    <>
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <section
        className="w-full py-16"
        style={{ backgroundColor: 'var(--color-secondary)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1
              className="text-4xl font-bold tracking-tight mb-3"
              style={{ color: 'var(--color-primary)' }}
            >
              {galleryModule.title ?? 'Galería'}
            </h1>
            {galleryModule.subtitle && (
              <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
                {galleryModule.subtitle}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Grid de imágenes ───────────────────────────────────────── */}
      <GalleryGrid items={galleryItems} columns={3} bg="default" size="md" />
    </>
  )
}
