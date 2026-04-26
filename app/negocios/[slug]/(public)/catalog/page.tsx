/**
 * Catalog — catálogo público del negocio
 *
 * Ruta: /negocios/[slug]/catalog
 * Acceso: público
 *
 * Muestra productos destacados y el catálogo completo agrupado por categoría.
 * Navegación por anclas mediante CategoryNav sticky.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { globalConfig } from '@/config'
import { getCategories, getProducts, getFeaturedProducts } from '@/services/catalog.service'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { Section } from '@/components/ui/Section'
import { CategoryNav } from '@/components/sections/CategoryNav'
import { ProductCard } from '@/components/sections/ProductCard'
import { CtaWhatsappSection } from '@/components/features/CtaWhatsappSection'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { identity, seoDefaults } = globalConfig

  return {
    title: 'Catálogo',
    description: `Explora el catálogo completo de ${identity.name}. ${seoDefaults.defaultDescription ?? ''}`.trim(),
    openGraph: {
      url: `/negocios/${slug}/catalog`,
    },
  }
}

export default async function CatalogPage({ params }: Props) {
  await params

  const { modules, contact, identity } = globalConfig

  // Guarda de módulo — 404 si está deshabilitado
  if (!modules.pages.catalog.enabled) notFound()

  const catalogModule = modules.pages.catalog

  // Carga paralela de categorías y destacados
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ])

  // Productos por categoría — incluye no-disponibles para mostrar badge "Agotado"
  const productsByCategory = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      products: await getProducts({ categoryId: cat.id, onlyAvailable: false }),
    }))
  )

  // URL WhatsApp por producto
  function productOrderUrl(productName: string): string | undefined {
    if (!contact.whatsapp) return undefined
    return getWhatsAppUrl(`Hola ${identity.name}, quisiera pedir: ${productName}.`)
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
            {catalogModule.title}
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            {catalogModule.subtitle}
          </p>
        </div>
      </Section>

      {/* ── Navegación por categorías (sticky) ─────────────────────── */}
      <CategoryNav categories={categories} />

      {/* ── Productos destacados ────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <Section bg="surface" size="md">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            {catalogModule.featuredTitle}
          </h2>
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  orderHref={productOrderUrl(product.name)}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Catálogo por categorías ─────────────────────────────────── */}
      {productsByCategory.map(({ category, products }) => (
        <Section key={category.id} bg="default" size="md" id={category.slug}>
          {/* Cabecera de categoría */}
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
            <p
              className="text-sm py-4"
              style={{ color: 'var(--color-text-subtle)' }}
            >
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
      {contact.whatsapp && catalogModule.cta && (
        <CtaWhatsappSection
          title={catalogModule.cta.title}
          subtitle={catalogModule.cta.subtitle}
          buttonLabel={catalogModule.cta.buttonLabel}
          message={catalogModule.cta.message}
          bg="secondary"
          size="md"
        />
      )}
    </>
  )
}
