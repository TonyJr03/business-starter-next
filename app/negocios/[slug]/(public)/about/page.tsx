/**
 * About — página informativa del negocio
 *
 * Ruta: /negocios/[slug]/about
 * Acceso: público
 *
 * Secciones:
 *   1. Hero         — H1 + subtítulo del módulo (bg secondary)
 *   2. Historia     — foto del local/equipo + párrafos de story (bg default)
 *   3. Misión       — frase destacada + cards de diferenciadores (bg surface)
 *   4. Contacto     — dirección, teléfono, email, redes sociales (bg default)
 *   5. Horarios     — tabla de horarios de atención (bg surface)
 *   6. CTA          — llamada a la acción por WhatsApp (bg secondary)
 *
 * Los datos editoriales (story, mission, differentiators, teamImageUrl) vienen
 * de la tabla `business_about` vía about.service.
 * Los datos operativos (dirección, teléfono, horarios) vienen del tenant resuelto.
 * Si `business_about` no tiene fila para el negocio, las secciones Historia y
 * Misión se omiten (degradación elegante).
 */

import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug } from '@/services/business.service'
import { getAboutContent } from '@/services/about.service'
import { resolvePageModule } from '@/lib/modules/resolver'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
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

  // Datos del tenant y contenido About en paralelo
  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()

  const [aboutModule, aboutContent] = await Promise.all([
    Promise.resolve(resolvePageModule(business, 'about')),
    getAboutContent(business.id),
  ])

  if (!aboutModule.enabled) notFound()

  const hasSocial = business.social && Object.values(business.social).some(Boolean)

  return (
    <>
      {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
      <Section bg="secondary" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl font-bold tracking-tight mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            {aboutModule.title ?? 'Sobre Nosotros'}
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {aboutModule.subtitle ?? `Conoce la historia y los valores detrás de ${business.name}.`}
          </p>
        </div>
      </Section>

      {/* ── 2. Historia ────────────────────────────────────────────────────── */}
      {aboutContent && aboutContent.story.length > 0 && (
        <Section bg="default" size="md">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Imagen del local/equipo */}
              {aboutContent.teamImageUrl && (
                <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-lg order-last lg:order-first">
                  <Image
                    src={aboutContent.teamImageUrl}
                    alt={`El equipo de ${business.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              )}

              {/* Párrafos de historia */}
              <div className={aboutContent.teamImageUrl ? '' : 'lg:col-span-2 max-w-3xl'}>
                <SectionHeading
                  title="Nuestra Historia"
                  className="mb-8 text-left"
                />
                <div className="space-y-5">
                  {aboutContent.story.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-base leading-relaxed"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </Section>
      )}

      {/* ── 3. Misión + Diferenciadores ────────────────────────────────────── */}
      {aboutContent && (aboutContent.mission || (aboutContent.differentiators ?? []).length > 0) && (
        <Section bg="surface" size="md">
          <div className="max-w-4xl mx-auto">

            {/* Declaración de misión */}
            {aboutContent.mission && (
              <blockquote
                className="text-center text-xl md:text-2xl font-medium italic leading-relaxed mb-14 px-4"
                style={{ color: 'var(--color-primary)' }}
              >
                &ldquo;{aboutContent.mission}&rdquo;
              </blockquote>
            )}

            {/* Cards de diferenciadores */}
            {(aboutContent.differentiators ?? []).length > 0 && (
              <>
                <SectionHeading
                  title="¿Por qué elegirnos?"
                  className="mb-10"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aboutContent.differentiators!.map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-3 p-6 rounded-2xl shadow-sm border"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border, #e5e7eb)',
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--color-secondary)' }}
                        aria-hidden="true"
                      >
                        <DifferentiatorIcon icon={item.icon} />
                      </div>
                      <h3
                        className="font-semibold text-base"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </Section>
      )}

      {/* ── 4. Contacto ────────────────────────────────────────────────────── */}
      <Section bg="default" size="md">
        <div className="max-w-3xl mx-auto">
          <SectionHeading title="Dónde encontrarnos" className="mb-8" />
          <ul className="space-y-5" style={{ color: 'var(--color-text)' }}>

            {(business.address || business.city) && (
              <li className="flex items-start gap-3">
                <IconPin />
                <span>
                  {business.address ? `${business.address}, ` : ''}
                  {business.city ?? ''}
                  {business.country ? `, ${business.country}` : ''}
                </span>
              </li>
            )}

            {business.phone && (
              <li className="flex items-center gap-3">
                <IconPhone />
                <a
                  href={`tel:${business.phone}`}
                  className="hover:underline"
                  style={{ color: 'var(--color-text)' }}
                >
                  {business.phone}
                </a>
              </li>
            )}

            {business.email && (
              <li className="flex items-center gap-3">
                <IconMail />
                <a
                  href={`mailto:${business.email}`}
                  className="hover:underline"
                  style={{ color: 'var(--color-text)' }}
                >
                  {business.email}
                </a>
              </li>
            )}

            {hasSocial && (
              <li className="flex items-start gap-3">
                <IconShare />
                <div className="flex flex-wrap gap-4">
                  {business.social?.instagram && (
                    <a
                      href={business.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-sm"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Instagram
                    </a>
                  )}
                  {business.social?.facebook && (
                    <a
                      href={business.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-sm"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Facebook
                    </a>
                  )}
                  {business.social?.twitter && (
                    <a
                      href={business.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-sm"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      X / Twitter
                    </a>
                  )}
                </div>
              </li>
            )}

          </ul>
        </div>
      </Section>

      {/* ── 5. Horarios ────────────────────────────────────────────────────── */}
      {(business.hours ?? []).length > 0 && (
        <OpeningHoursSection
          hours={business.hours!}
          title="Horarios de atención"
          bg="surface"
          size="md"
        />
      )}

      {/* ── 6. CTA WhatsApp ─────────────────────────────────────────────────── */}
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

// ─── Iconos SVG inline ────────────────────────────────────────────────────────

function IconPin() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5 mt-0.5 shrink-0"
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
      style={{ color: 'var(--color-primary)' }} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0"
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
      style={{ color: 'var(--color-primary)' }} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0"
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
      style={{ color: 'var(--color-primary)' }} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function IconShare() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5 mt-0.5 shrink-0"
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
      style={{ color: 'var(--color-primary)' }} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  )
}

// ─── Icono de diferenciador ───────────────────────────────────────────────────
// Mapea el string 'icon' del dato a un SVG reconocible.
// Si el icon no está mapeado, muestra un check genérico como fallback.

function DifferentiatorIcon({ icon }: { icon?: string }) {
  const style = { color: 'var(--color-primary)' }

  if (icon === 'coffee') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" style={style} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
      </svg>
    )
  }
  if (icon === 'heart') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" style={style} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  }
  if (icon === 'map-pin') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" style={style} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
  if (icon === 'star') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" style={style} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  }
  // Fallback: check genérico
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" style={style} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 13l4 4L19 7" />
    </svg>
  )
}
