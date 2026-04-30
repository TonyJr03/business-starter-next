/**
 * Gallery — galería de imágenes del negocio
 *
 * Ruta: /negocios/[slug]/gallery
 * Ruta con filtro: /negocios/[slug]/gallery?album=<slug>
 * Acceso: público
 *
 * Secciones:
 *   1. Hero       — H1 + subtítulo del módulo (bg secondary)
 *   2. AlbumBar   — píldoras de filtro por álbum (bg default)
 *   3. Grid       — fotos filtradas por álbum o todas (bg default)
 *   4. Vacío      — mensaje cuando no hay fotos en BD (bg default)
 *   5. CTA        — llamada a la acción por WhatsApp (bg surface)
 *
 * Las fotos y álbumes provienen de gallery_albums + gallery_photos vía gallery.service.
 * El filtro ?album=slug es manejado en el servidor — no requiere JS.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug } from '@/services/business.service'
import { getGalleryAlbums, getGalleryPhotos } from '@/services/gallery.service'
import { resolvePageModule } from '@/lib/modules/resolver'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GalleryGrid } from '@/components/sections/GalleryGrid'
import { GalleryAlbumBar } from '@/components/sections/GalleryAlbumBar'
import { CtaWhatsappSection } from '@/components/features/CtaWhatsappSection'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ album?: string }>
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

export default async function GalleryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { album: albumSlug } = await searchParams

  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()

  const galleryModule = resolvePageModule(business, 'gallery')
  if (!galleryModule.enabled) notFound()

  // Carga paralela: álbumes + todos los IDs necesarios para resolver el filtro
  const albums = await getGalleryAlbums(business.id)

  // Resuelve el albumId desde el slug del query param
  const activeAlbum = albumSlug
    ? albums.find((a) => a.slug === albumSlug)
    : undefined

  // Si se pidió un slug que no existe, redirige a la galería base
  if (albumSlug && !activeAlbum) notFound()

  // Carga de fotos (filtradas por álbum o todas)
  const photos = await getGalleryPhotos(business.id, activeAlbum?.id)

  const basePath = `/negocios/${slug}/gallery`
  const ctaConfig = galleryModule.cta

  return (
    <>
      {/* ── 1. Hero ──────────────────────────────────────────────────── */}
      <Section bg="secondary" size="md">
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
      </Section>

      {/* ── 2. Barra de álbumes ──────────────────────────────────────── */}
      {albums.length > 0 && (
        <Section bg="default" size="sm">
          <GalleryAlbumBar
            albums={albums}
            activeSlug={activeAlbum?.slug}
            basePath={basePath}
          />
        </Section>
      )}

      {/* ── 3. Grid de fotos / 4. Estado vacío ──────────────────────── */}
      {photos.length > 0 ? (
        <GalleryGrid items={photos} columns={3} bg="default" size="md" />
      ) : (
        <Section bg="default" size="lg">
          <div className="max-w-md mx-auto text-center py-8">
            <SectionHeading
              title={activeAlbum ? `${activeAlbum.name}` : 'Sin fotos todavía'}
              subtitle={
                activeAlbum
                  ? 'Aún no hay fotos en este álbum. Vuelve pronto.'
                  : 'Pronto subiremos imágenes de nuestro espacio y productos.'
              }
            />
          </div>
        </Section>
      )}

      {/* ── 5. CTA WhatsApp ──────────────────────────────────────────── */}
      {ctaConfig && (
        <CtaWhatsappSection
          title={ctaConfig.title}
          subtitle={ctaConfig.subtitle}
          buttonLabel={ctaConfig.buttonLabel}
          message={ctaConfig.message}
          phoneNumber={business.whatsapp}
          bg="surface"
        />
      )}
    </>
  )
}

