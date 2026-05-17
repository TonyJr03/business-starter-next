import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { resolveBusinessBySlug, getCatalogs } from '@/services'
import { resolvePageModule } from '@/lib/modules/resolver'
import { Section } from '@/components/ui/Section'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  return {
    title: 'Catálogo',
    description: `Explora los catálogos de ${business?.name ?? ''}.`,
    openGraph: { url: `/negocios/${slug}/catalog` },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CatalogEntryPage({ params }: Props) {
  const { slug } = await params

  // — tenant
  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()
  const catalogModule = resolvePageModule(business, 'catalog')
  if (!catalogModule.enabled) notFound()

  // — datos
  const catalogs = await getCatalogs(business.id)
  if (catalogs.length === 0) notFound()
  if (catalogs.length === 1) redirect(`/negocios/${slug}/catalog/${catalogs[0].slug}`)

  return (
    <>
      {/* ── Encabezado ── */}
      <Section bg="secondary" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            {catalogModule.title}
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            {catalogModule.subtitle ?? 'Elige el catálogo que quieres explorar.'}
          </p>
        </div>
      </Section>

      {/* ── Selección ── */}
      <Section bg="default" size="lg">
        <ul className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {catalogs.map((catalog) => (
            <li key={catalog.id}>
              <Link
                href={`/negocios/${slug}/catalog/${catalog.slug}`}
                className="group flex flex-col h-full rounded-2xl border overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  ['--tw-ring-color' as string]: 'var(--color-primary)',
                }}
              >
                {/* Imagen del catálogo */}
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
                  {catalog.imageUrl ? (
                    <Image
                      src={catalog.imageUrl}
                      alt={catalog.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-border)' }}
                      aria-hidden="true"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="size-12"
                        style={{ color: 'var(--color-text-subtle)' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1.5 p-5">
                  <h2
                    className="text-lg font-bold leading-snug"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {catalog.name}
                  </h2>
                  {catalog.description && (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {catalog.description}
                    </p>
                  )}
                  <span
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Ver catálogo
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
