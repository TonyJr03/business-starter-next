import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug, getCatalogBySlug, getCategoriesByCatalog, getProducts } from '@/services'
import { resolvePageModule, resolveSectionModule, resolveFeatureModule } from '@/lib/modules/resolver'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { Section } from '@/components/ui/Section'
import { CategoryNav } from '@/components/sections/CategoryNav'
import { ProductCard } from '@/components/sections/ProductCard'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { CtaWhatsappSection } from '@/components/features/CtaWhatsappSection'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string; catalogSlug: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, catalogSlug } = await params
  const business = await resolveBusinessBySlug(slug)

  if (!business || !business.isActive) {
    return { robots: { index: false, follow: false } }
  }
  if (!resolvePageModule(business, 'catalog').enabled) {
    return { robots: { index: false, follow: false } }
  }

  const catalog = await getCatalogBySlug(business.id, catalogSlug)
  
  if (!catalog) {
    return { title: 'Catálogo no encontrado', robots: { index: false, follow: false } }
  }

  return {
    title: catalog.name,
    description: catalog.description ?? `Explora ${catalog.name} de ${business.name}.`,
    openGraph: { url: `/negocios/${slug}/catalog/${catalogSlug}` },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CatalogPage({ params }: Props) {
  const { slug, catalogSlug } = await params

  // — tenant
  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()
  const catalogModule = resolvePageModule(business, 'catalog')
  if (!catalogModule.enabled) notFound()
  const whatsappCta = resolveSectionModule(business, 'whatsapp_cta')
  const cartFeature = resolveFeatureModule(business, 'cart')
  const whatsappOrdering = resolveFeatureModule(business, 'whatsappOrdering')

  // — datos
  const catalog = await getCatalogBySlug(business.id, catalogSlug)
  if (!catalog) notFound()

  const [categories, allProducts] = await Promise.all([
    getCategoriesByCatalog(business.id, catalog.id),
    getProducts(business.id),
  ])
  const categoryIds = categories.map((c) => c.id)

  const featuredProducts = allProducts.filter(
    (p) => p.isFeatured && (p.isAvailable ?? true) && categoryIds.includes(p.categoryId ?? '')
  )
  const productsByCategory = categories.map((cat) => ({
    category: cat,
    products: allProducts.filter((p) => p.categoryId === cat.id),
  }))

  function productOrderUrl(productName: string): string | undefined {
    if (!whatsappOrdering.enabled) return undefined
    if (!business?.contact?.whatsapp) return undefined
    return getWhatsAppUrl(`Hola ${business.name}, quisiera pedir: ${productName}.`, business.contact.whatsapp)
  }

  return (
    <>
      {/* ── Encabezado ── */}
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

      {/* ── Categorías ── */}
      <CategoryNav categories={categories} />

      {/* ── Destacados ── */}
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
                  orderHref={cartFeature.enabled ? undefined : productOrderUrl(product.name)}
                  actionSlot={cartFeature.enabled ? <AddToCartButton product={product} /> : undefined}
                  priority={i === 0}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Catálogo ── */}
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
              {catalogModule.emptyMessage}
            </p>
          ) : (
            <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductCard
                    product={product}
                    orderHref={cartFeature.enabled ? undefined : productOrderUrl(product.name)}
                    actionSlot={cartFeature.enabled ? <AddToCartButton product={product} /> : undefined}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>
      ))}

      {/* ── CTA WhatsApp ── */}
      {whatsappCta.enabled && business?.contact?.whatsapp && (
        <CtaWhatsappSection
          {...whatsappCta}
          contextTitle="¿Listo para hacer tu pedido?"
          contextMessage="Hola, me gustaría hacer un pedido del catálogo."
          phoneNumber={business.contact.whatsapp}
        />
      )}
    </>
  )
}
