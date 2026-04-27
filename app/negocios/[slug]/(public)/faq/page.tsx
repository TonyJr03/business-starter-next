/**
 * FAQ — preguntas frecuentes del negocio
 *
 * Ruta: /negocios/[slug]/faq
 * Acceso: público
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug } from '@/services/business.service'
import { resolvePageModule } from '@/lib/modules/resolver'
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

  // Guarda de módulo — respeta overrides por tenant
  const faqModule = resolvePageModule(business, 'faq')
  if (!faqModule.enabled) notFound()

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
              {faqModule.title ?? 'Preguntas Frecuentes'}
            </h1>
            {faqModule.subtitle && (
              <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
                {faqModule.subtitle}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Acordeón de preguntas ───────────────────────────────────── */}
      <FaqSection items={[]} bg="default" size="md" />

      {/* ── CTA WhatsApp ───────────────────────────────────────────── */}
      {business?.whatsapp && faqModule.cta && (
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
