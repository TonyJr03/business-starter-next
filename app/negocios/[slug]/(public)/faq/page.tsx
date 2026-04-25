/**
 * FAQ — preguntas frecuentes del negocio
 *
 * Ruta: /negocios/[slug]/faq
 * Acceso: público
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { globalConfig } from '@/config'
import { faqItems } from '@/data'
import { FaqSection } from '@/components/sections/FaqSection'
import { CtaWhatsappSection } from '@/components/sections/CtaWhatsappSection'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { identity } = globalConfig

  return {
    title: 'Preguntas Frecuentes',
    description: `Resolvemos tus dudas sobre ${identity.name}: pedidos, horarios, menú y más.`,
    openGraph: {
      url: `/negocios/${slug}/faq`,
    },
  }
}

export default async function FaqPage({ params }: Props) {
  await params

  const { modules, contact } = globalConfig

  // Guarda de módulo — 404 si está deshabilitado
  if (!modules.pages.faq.enabled) notFound()

  const faqModule = modules.pages.faq

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
      <FaqSection items={faqItems} bg="default" size="md" />

      {/* ── CTA WhatsApp ───────────────────────────────────────────── */}
      {contact.whatsapp && faqModule.cta && (
        <CtaWhatsappSection
          title={faqModule.cta.title}
          subtitle={faqModule.cta.subtitle}
          message={faqModule.cta.message}
          buttonLabel={faqModule.cta.buttonLabel}
          bg="surface"
          size="md"
        />
      )}
    </>
  )
}
