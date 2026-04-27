/**
 * About — página informativa del negocio
 *
 * Ruta: /negocios/[slug]/about
 * Acceso: público
 *
 * Muestra la historia, misión, diferenciadores y datos de ubicación del negocio.
 * Los datos editoriales (story, mission, differentiators) vienen de `data/about-content.ts`.
 * Los datos operativos (dirección, teléfono, horarios) vienen del tenant resuelto.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug } from '@/services/business.service'
import { resolvePageModule } from '@/lib/modules/resolver'
import { Section } from '@/components/ui/Section'
import { OpeningHoursSection } from '@/components/sections/OpeningHoursSection'
import { CtaWhatsappSection } from '@/components/features/CtaWhatsappSection'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  return {
    title: 'Sobre Nosotros',
    description: `Conoce la historia, misión y valores detrás de ${business?.name ?? ''}.`,
    openGraph: {
      url: `/negocios/${slug}/about`,
    },
  }
}

export default async function AboutPage({ params }: Props) {
  const { slug } = await params

  // Datos del tenant (deduplicados via React cache — ya resuelto en layout)
  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()

  // Guarda de módulo — respeta overrides por tenant
  const aboutModule = resolvePageModule(business, 'about')
  if (!aboutModule.enabled) notFound()

  return (
    <>
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <Section bg="secondary" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            {aboutModule.title ?? 'Sobre Nosotros'}
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            {aboutModule.subtitle ?? `Conoce la historia y los valores detrás de ${business.name}.`}
          </p>
        </div>
      </Section>

      {/* ── Ubicación ──────────────────────────────────────────────── */}
      <Section bg="surface" size="md">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Dónde encontrarnos
          </h2>
          <ul className="space-y-4" style={{ color: 'var(--color-text)' }}>

            {/* Dirección */}
            <li className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-5 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {business.address ? `${business.address}, ` : ''}
                {business.city ?? ''}
                {business.country ? `, ${business.country}` : ''}
              </span>
            </li>

            {/* Teléfono */}
            {business.phone && (
              <li className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a
                  href={`tel:${business.phone}`}
                  className="hover:underline"
                  style={{ color: 'var(--color-text)' }}
                >
                  {business.phone}
                </a>
              </li>
            )}

            {/* Email */}
            {business.email && (
              <li className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href={`mailto:${business.email}`}
                  className="hover:underline"
                  style={{ color: 'var(--color-text)' }}
                >
                  {business.email}
                </a>
              </li>
            )}

          </ul>
        </div>
      </Section>

      {/* ── Horarios ───────────────────────────────────────────────── */}
      {(business.hours ?? []).length > 0 && (
        <OpeningHoursSection
          hours={business.hours!}
          title="Horarios de atención"
          bg="default"
          size="md"
        />
      )}

      {/* ── CTA WhatsApp ───────────────────────────────────────────── */}
      {business.whatsapp && aboutModule.cta && (
        <CtaWhatsappSection
          title={aboutModule.cta.title}
          subtitle={aboutModule.cta.subtitle}
          buttonLabel={aboutModule.cta.buttonLabel}
          message={aboutModule.cta.message}
          phoneNumber={business.whatsapp}
          bg="secondary"
          size="md"
        />
      )}
    </>
  )
}
