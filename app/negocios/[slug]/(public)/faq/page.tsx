import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug, getFaqItems } from '@/services'
import { resolvePageModule, resolveSectionModule } from '@/lib/modules/resolver'
import { Section } from '@/components/ui/Section'
import { FaqSection } from '@/components/sections/FaqSection'
import { CtaWhatsappSection } from '@/components/features/CtaWhatsappSection'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FaqPage({ params }: Props) {
  const { slug } = await params

  // — tenant
  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()
  const faqModule = resolvePageModule(business, 'faq')
  if (!faqModule.enabled) notFound()
  const whatsappCta = resolveSectionModule(business, 'whatsapp_cta')

  // — datos
  const items = await getFaqItems(business.id)

  return (
    <>
      {/* ── Hero ── */}
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

      {/* ── Preguntas ── */}
      {items.length > 0 ? (
        <FaqSection items={items} layout={{ bg: 'default', size: 'md' }} />
      ) : (
        <Section bg="default" size="md">
          <div className="max-w-2xl mx-auto text-center py-8">
            <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
              {faqModule.emptyMessage}
            </p>
          </div>
        </Section>
      )}

      {/* ── CTA WhatsApp ── */}
      {whatsappCta.enabled && business.contact?.whatsapp && (
        <CtaWhatsappSection
          {...whatsappCta}
          contextTitle="¿Tienes más preguntas?"
          contextMessage="Hola, tengo una consulta que no encontré en las preguntas frecuentes."
          phoneNumber={business.contact.whatsapp}
        />
      )}
    </>
  )
}
