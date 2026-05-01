/**
 * FAQ — preguntas frecuentes del negocio
 *
 * Ruta: /negocios/[slug]/faq
 * Acceso: público
 *
 * Secciones:
 *   1. Hero      — H1 + subtítulo del módulo (bg secondary)
 *   2. Preguntas — acordeón agrupado por categoría vía FaqSection (bg default)
 *   3. Vacío     — mensaje cuando no hay ítems en BD (bg default)
 *   4. CTA       — llamada a la acción por WhatsApp (bg surface)
 *
 * Los ítems provienen de la tabla `business_faq_items` vía faq.service.
 * Si no hay ítems, se muestra un estado vacío con CTA directo a WhatsApp.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug, getFaqItems } from '@/services'
import { resolvePageModule } from '@/lib/modules/resolver'
import { Section } from '@/components/ui/Section'
import { FaqSection } from '@/components/sections/FaqSection'
import { CtaWhatsappSection } from '@/components/features/CtaWhatsappSection'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  return {
    title: 'Preguntas Frecuentes',
    description: `Resolvemos tus dudas sobre ${business?.name ?? ''}: pedidos, horarios, catálogos y más.`,
    openGraph: {
      url: `/negocios/${slug}/faq`,
    },
  }
}

export default async function FaqPage({ params }: Props) {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()

  const [faqModule, items] = await Promise.all([
    Promise.resolve(resolvePageModule(business, 'faq')),
    getFaqItems(business.id),
  ])

  if (!faqModule.enabled) notFound()

  return (
    <>
      {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
      <Section bg="secondary" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl font-bold tracking-tight mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            {faqModule.title ?? 'Preguntas Frecuentes'}
          </h1>
          {faqModule.subtitle && (
            <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {faqModule.subtitle}
            </p>
          )}
        </div>
      </Section>

      {/* ── 2. Acordeón / 3. Estado vacío ─────────────────────────────────── */}
      {items.length > 0 ? (
        <FaqSection items={items} bg="default" size="md" />
      ) : (
        <Section bg="default" size="md">
          <div className="max-w-2xl mx-auto text-center py-8">
            <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
              {faqModule.emptyMessage ?? 'Pronto publicaremos las preguntas frecuentes. Mientras tanto, escríbenos directamente.'}
            </p>
          </div>
        </Section>
      )}

      {/* ── 4. CTA WhatsApp ─────────────────────────────────────────────────── */}
      {business.whatsapp && faqModule.cta && (
        <CtaWhatsappSection
          title={faqModule.cta.title}
          subtitle={faqModule.cta.subtitle}
          message={faqModule.cta.message}
          buttonLabel={faqModule.cta.buttonLabel}
          phoneNumber={business.whatsapp}
          bg="surface"
          size="md"
        />
      )}
    </>
  )
}
