/**
 * Contact — página de contacto del negocio
 *
 * Ruta: /negocios/[slug]/contact
 * Acceso: público
 *
 * Muestra el CTA de WhatsApp, datos de contacto (dirección, teléfono, email,
 * redes sociales) y horarios de atención.
 *
 * Nota: el formulario de contacto con backend queda pendiente para M7+.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { globalConfig } from '@/config'
import { resolveBusinessBySlug } from '@/services/business.service'
import { Section } from '@/components/ui/Section'
import { OpeningHoursSection } from '@/components/sections/OpeningHoursSection'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { identity } = globalConfig

  return {
    title: 'Contacto',
    description: `Contáctanos por WhatsApp o visítanos en ${identity.name}.`,
    openGraph: {
      url: `/negocios/${slug}/contact`,
    },
  }
}

export default async function ContactPage({ params }: Props) {
  const { slug } = await params
  const { modules } = globalConfig

  // Guarda de módulo — 404 si está deshabilitado
  if (!modules.pages.contact.enabled) notFound()

  // Datos del tenant (deduplicados via React cache — ya resuelto en layout)
  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()

  const waNumber = (business.whatsapp ?? '').replace(/\D/g, '')
  const whatsappUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola ${business.name}, quisiera ponerme en contacto.`)}`
    : null

  return (
    <>
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <Section bg="secondary" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            Contáctanos
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            Estamos disponibles para atenderte. La forma más rápida es por WhatsApp.
          </p>
        </div>
      </Section>

      {/* ── CTA WhatsApp prominente ─────────────────────────────────── */}
      {whatsappUrl && (
        <Section bg="default" size="sm">
          <div className="max-w-xl mx-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl p-5 border transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
              aria-label="Escribirnos por WhatsApp"
            >
              {/* Ícono WhatsApp */}
              <span
                className="flex items-center justify-center size-14 rounded-full shrink-0"
                style={{ backgroundColor: '#25D366' }}
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="size-7"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75.75 0 0 0 .915.915l5.573-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 0 1-4.953-1.36l-.355-.212-3.683.972.985-3.595-.231-.37A9.694 9.694 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                </svg>
              </span>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Escríbenos por WhatsApp
                </p>
                <p
                  className="text-sm truncate"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {business.whatsapp} · Respuesta rápida
                </p>
              </div>

              {/* Flecha */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: 'var(--color-text-subtle)' }}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </Section>
      )}

      {/* ── Información de contacto ─────────────────────────────────── */}
      <Section bg="surface" size="md">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text)' }}
          >
            Información de contacto
          </h2>

          <ul className="space-y-5" style={{ color: 'var(--color-text)' }}>

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
              <span className="leading-relaxed">
                {business.address && <>{business.address}<br /></>}
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

          {/* Redes sociales */}
          {(business.social?.instagram || business.social?.facebook) && (
            <div className="space-y-3">
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                Síguenos
              </p>
              <div className="flex gap-3 flex-wrap">
                {business.social?.instagram && (
                  <a
                    href={business.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-colors hover:text-white"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                    aria-label="Instagram"
                  >
                    Instagram
                  </a>
                )}
                {business.social?.facebook && (
                  <a
                    href={business.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-colors hover:text-white"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                    aria-label="Facebook"
                  >
                    Facebook
                  </a>
                )}
              </div>
            </div>
          )}
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
    </>
  )
}
