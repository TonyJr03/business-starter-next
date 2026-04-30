/**
 * CatalogPage — catálogo de un tipo específico
 *
 * Ruta: /negocios/[slug]/catalog/[catalogSlug]
 * Acceso: público
 *
 * Muestra productos destacados y el catálogo completo agrupado por categoría,
 * filtrado por el catálogo indicado en la ruta.
 *
 * No exporta `generateStaticParams` porque el cliente de Supabase del servidor
 * usa `cookies()`, que no es compatible con el contexto de build. La ruta se
 * renderiza dinámicamente en cada request, lo que es correcto para datos
 * que pueden cambiar.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug } from '@/services/business.service'
import { resolvePageModule } from '@/lib/modules/resolver'
import {
  getCatalogBySlug,
  getCategories,
  getProducts,
  getFeaturedProducts,
} from '@/services/catalog.service'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { Section } from '@/components/ui/Section'
import { CategoryNav } from '@/components/sections/CategoryNav'
import { ProductCard } from '@/components/sections/ProductCard'
import { CtaWhatsappSection } from '@/components/features/CtaWhatsappSection'

interface Props {
  params: Promise<{ slug: string; catalogSlug: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, catalogSlug } = await params
  const [business, catalog] = await Promise.all([
    resolveBusinessBySlug(slug),
    getCatalogBySlug(catalogSlug),
  ])

  const catalogName = catalog?.name ?? 'Catálogo'

  return {
    title: catalogName,
    description: catalog?.description ?? `Explora ${catalogName} de ${business?.name ?? ''}.`,
    openGraph: { url: `/negocios/${slug}/catalog/${catalogSlug}` },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CatalogPage({ params }: Props) {
  const { slug, catalogSlug } = await params

  const [business, catalog] = await Promise.all([
    resolveBusinessBySlug(slug),
    getCatalogBySlug(catalogSlug),
  ])

  // Guarda de módulo
  const catalogModule = resolvePageModule(business, 'catalog')
  if (!catalogModule.enabled) notFound()

  // Catálogo no encontrado
  if (!catalog) notFound()

  // Categorías de este catálogo
  const categories = await getCategories({ catalogId: catalog.id })
  const categoryIds = categories.map((c) => c.id)

  // Carga paralela: productos por categoría + destacados filtrados por este catálogo
  const [productsByCategory, featuredProducts] = await Promise.all([
    Promise.all(
      categories.map(async (cat) => ({
        category: cat,
        products: await getProducts({ categoryId: cat.id, onlyAvailable: false }),
      }))
    ),
    categoryIds.length > 0
      ? getFeaturedProducts(categoryIds)
      : Promise.resolve([]),
  ])

  // URL WhatsApp por producto
  function productOrderUrl(productName: string): string | undefined {
    if (!business?.whatsapp) return undefined
    return getWhatsAppUrl(`Hola ${business.name}, quisiera pedir: ${productName}.`, business.whatsapp)
  }

  return (
    <>
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <Section bg="secondary" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            {catalog.name}
          </h1>
          {(catalog.description ?? catalogModule.subtitle) && (
            <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
              {catalog.description ?? catalogModule.subtitle}
            </p>
          )}
        </div>
      </Section>

      {/* ── Navegación por categorías (sticky) ─────────────────────── */}
      <CategoryNav categories={categories} />

      {/* ── Productos destacados de este catálogo ───────────────────── */}
      {featuredProducts.length > 0 && (
        <Section bg="surface" size="md">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            {catalogModule.featuredTitle}
          </h2>
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product, i) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  orderHref={productOrderUrl(product.name)}
                  priority={i === 0}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Catálogo por categorías ─────────────────────────────────── */}
      {productsByCategory.map(({ category, products }) => (
        <Section key={category.id} bg="default" size="md" id={category.slug}>
          <div className="flex items-center gap-4 mb-2">
            <h2
              className="text-2xl font-bold whitespace-nowrap"
              style={{ color: 'var(--color-primary)' }}
            >
              {category.name}
            </h2>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
          </div>

          {category.description && (
            <p
              className="text-sm mb-8"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {category.description}
            </p>
          )}

          {products.length === 0 ? (
            <p className="text-sm py-4" style={{ color: 'var(--color-text-subtle)' }}>
              Sin productos en esta categoría por el momento.
            </p>
          ) : (
            <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductCard
                    product={product}
                    orderHref={productOrderUrl(product.name)}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>
      ))}

      {/* ── CTA WhatsApp ───────────────────────────────────────────── */}
      {business?.whatsapp && catalogModule.cta && (
        <CtaWhatsappSection
          title={catalogModule.cta.title}
          subtitle={catalogModule.cta.subtitle}
          buttonLabel={catalogModule.cta.buttonLabel}
          message={catalogModule.cta.message}
          phoneNumber={business.whatsapp}
          bg="secondary"
          size="md"
        />
      )}
    </>
  )
}
