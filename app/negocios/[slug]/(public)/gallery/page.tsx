import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug, getGalleryAlbums, getGalleryPhotos, getPhotosByAlbum } from '@/services'
import { resolvePageModule } from '@/lib/modules/resolver'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { GalleryGrid } from '@/components/sections/GalleryGrid'
import { GalleryAlbumBar } from '@/components/sections/GalleryAlbumBar'
import { CtaWhatsappSection } from '@/components/features/CtaWhatsappSection'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ album?: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GalleryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { album: albumSlug } = await searchParams

  // — tenant
  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()
  const galleryModule = resolvePageModule(business, 'gallery')
  if (!galleryModule.enabled) notFound()

  // — datos
  const albums = await getGalleryAlbums(business.id)
  const activeAlbum = albumSlug ? albums.find((a) => a.slug === albumSlug) : undefined
  if (albumSlug && !activeAlbum) notFound()
  const photos = activeAlbum
    ? await getPhotosByAlbum(business.id, activeAlbum.id)
    : await getGalleryPhotos(business.id)

  const basePath = `/negocios/${slug}/gallery`
  const ctaConfig = galleryModule.cta

  return (
    <>
      {/* ── Hero ── */}
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

      {/* ── Álbumes ── */}
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

      {/* ── CTA WhatsApp ── */}
      {ctaConfig && (
        <CtaWhatsappSection
          title={ctaConfig.title}
          subtitle={ctaConfig.subtitle}
          buttonLabel={ctaConfig.buttonLabel}
          message={ctaConfig.message}
          phoneNumber={business.contact?.whatsapp}
          bg="surface"
        />
      )}
    </>
  )
}

