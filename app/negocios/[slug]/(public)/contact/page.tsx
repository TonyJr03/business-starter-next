import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug } from '@/services'
import { resolvePageModule } from '@/lib/modules/resolver'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { OpeningHoursSection } from '@/components/sections/OpeningHoursSection'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  return {
    title: 'Contacto',
    description: `Contáctanos por WhatsApp o visítanos en ${business?.name ?? ''}.`,
    openGraph: {
      url: `/negocios/${slug}/contact`,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ContactPage({ params }: Props) {
  const { slug } = await params

  // — tenant
  const business = await resolveBusinessBySlug(slug)
  if (!business) notFound()
  const contactModule = resolvePageModule(business, 'contact')
  if (!contactModule.enabled) notFound()

  // — datos
  const whatsappUrl = getWhatsAppUrl(
    `Hola ${business.name}, quisiera ponerme en contacto.`,
    business.contact?.whatsapp,
  )

  const social = business.social ?? {}
  const socialLinks = [
    { key: 'instagram', label: 'Instagram', href: social.instagram },
    { key: 'facebook',  label: 'Facebook',  href: social.facebook  },
    { key: 'twitter',   label: 'X / Twitter', href: social.twitter },
    { key: 'tiktok',    label: 'TikTok',    href: social.tiktok    },
    { key: 'telegram',  label: 'Telegram',  href: social.telegram  },
    { key: 'youtube',   label: 'YouTube',   href: social.youtube   },
  ].filter((s): s is { key: string; label: string; href: string } => Boolean(s.href))

  return (
    <>
      {/* ── Hero ── */}
      <Section bg="secondary" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl font-bold tracking-tight mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            {contactModule.title ?? 'Contáctanos'}
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {contactModule.subtitle ?? 'Estamos disponibles para atenderte. La forma más rápida es por WhatsApp.'}
          </p>
        </div>
      </Section>

      {/* ── Canales ── */}
      <Section bg="default" size="md">
        <div className="max-w-4xl mx-auto">
          <SectionHeading title="Cómo contactarnos" className="mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* WhatsApp */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 rounded-2xl border transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: '#f0fdf4',
                  borderColor: '#bbf7d0',
                }}
              >
                <span
                  className="flex items-center justify-center size-12 rounded-full shrink-0"
                  style={{ backgroundColor: '#25D366' }}
                  aria-hidden="true"
                >
                  <IconWhatsapp />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-base" style={{ color: '#166534' }}>
                    WhatsApp
                  </p>
                  <p className="text-sm mt-0.5 truncate" style={{ color: '#166534', opacity: 0.75 }}>
                    {business.contact?.whatsapp}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#166534', opacity: 0.6 }}>
                    Respuesta rápida
                  </p>
                </div>
              </a>
            )}

            {/* Teléfono */}
            {business.contact?.phone && (
              <a
                href={`tel:${business.contact.phone}`}
                className="flex items-start gap-4 p-5 rounded-2xl border transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border, #e5e7eb)',
                }}
              >
                <span
                  className="flex items-center justify-center size-12 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                  aria-hidden="true"
                >
                  <IconPhone />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                    Teléfono
                  </p>
                  <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {business.contact?.phone}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Llámanos directamente
                  </p>
                </div>
              </a>
            )}

            {/* Email */}
            {business.contact?.email && (
              <a
                href={`mailto:${business.contact.email}`}
                className="flex items-start gap-4 p-5 rounded-2xl border transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border, #e5e7eb)',
                }}
              >
                <span
                  className="flex items-center justify-center size-12 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                  aria-hidden="true"
                >
                  <IconMail />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                    Correo electrónico
                  </p>
                  <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {business.contact?.email}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Escríbenos cuando quieras
                  </p>
                </div>
              </a>
            )}

          </div>
        </div>
      </Section>

      {/* ── Ubicación ── */}
      {(business.location?.address || business.location?.city || socialLinks.length > 0) && (
        <Section bg="surface" size="md">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Dirección */}
            {(business.location?.address || business.location?.city) && (
              <div>
                <SectionHeading title="Dónde encontrarnos" className="mb-6 text-left" />
                <div className="flex items-start gap-3" style={{ color: 'var(--color-text)' }}>
                  <IconPin className="mt-0.5 shrink-0" />
                  <address className="not-italic leading-relaxed text-base">
                    {business.location?.address && <span className="block">{business.location.address}</span>}
                    {business.location?.city && (
                      <span className="block">
                        {business.location.city}
                        {business.location.country ? `, ${business.location.country}` : ''}
                      </span>
                    )}
                  </address>
                </div>
              </div>
            )}

            {/* Redes sociales */}
            {socialLinks.length > 0 && (
              <div>
                <SectionHeading title="Síguenos" className="mb-6 text-left" />
                <ul className="flex flex-col gap-3">
                  {socialLinks.map(({ key, label, href }) => (
                    <li key={key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 text-sm font-medium hover:underline"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <SocialIcon platform={key} />
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </Section>
      )}

      {/* ── Horarios ── */}
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

// ─── Iconos SVG inline ────────────────────────────────────────────────────────

function IconWhatsapp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"
      className="size-6" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75.75 0 0 0 .915.915l5.573-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 0 1-4.953-1.36l-.355-.212-3.683.972.985-3.595-.231-.37A9.694 9.694 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none"
      viewBox="0 0 24 24" stroke="currentColor"
      style={{ color: 'var(--color-primary)' }} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none"
      viewBox="0 0 24 24" stroke="currentColor"
      style={{ color: 'var(--color-primary)' }} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`size-5 ${className ?? ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
      style={{ color: 'var(--color-primary)' }} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

// ─── Iconos de redes sociales ─────────────────────────────────────────────────

function SocialIcon({ platform }: { platform: string }) {
  const cls = 'size-5 shrink-0'

  if (platform === 'instagram') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24"
        fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    )
  }

  if (platform === 'facebook') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24"
        fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )
  }

  if (platform === 'twitter') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24"
        fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  }

  if (platform === 'tiktok') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24"
        fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.25 8.25 0 0 0 4.83 1.55V6.79a4.86 4.86 0 0 1-1.06-.1z" />
      </svg>
    )
  }

  if (platform === 'telegram') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24"
        fill="currentColor" aria-hidden="true">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    )
  }

  if (platform === 'youtube') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24"
        fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )
  }

  // Fallback genérico
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none"
      viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}
