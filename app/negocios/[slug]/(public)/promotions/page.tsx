/**
 * Promotions — página pública de promociones del negocio
 *
 * Ruta: /negocios/[slug]/promotions
 * Acceso: público
 *
 * Muestra todas las promociones (activas, próximas, en pausa, expiradas)
 * con su estado visual derivado de fechas.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { resolveBusinessBySlug } from '@/services/business.service'
import { resolvePageModule } from '@/lib/modules/resolver'
import { getPromotions, getPromotionStatus } from '@/services/promotions.service'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { Section } from '@/components/ui/Section'
import { PromotionCard } from '@/components/sections/PromotionCard'
import { CtaWhatsappSection } from '@/components/features/CtaWhatsappSection'
import type { PromoStatus } from '@/components/sections/PromotionCard'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  return {
    title: 'Promociones',
    description: `Descubre las promociones y ofertas especiales de ${business?.name ?? ''}.`,
    openGraph: {
      url: `/negocios/${slug}/promotions`,
    },
  }
}

// Formatea rango de fechas legible en español
const dateFormatter = new Intl.DateTimeFormat('es-CU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Havana',
})

function formatDateRange(startsAt?: string, endsAt?: string): string | undefined {
  if (!startsAt && !endsAt) return undefined
  // Usamos T12:00:00Z para evitar conversión de zona horaria en fechas de calendario
  const toDate = (s: string) => new Date(`${s.slice(0, 10)}T12:00:00Z`)
  const parts: string[] = []
  if (startsAt) parts.push(`Desde el ${dateFormatter.format(toDate(startsAt))}`)
  if (endsAt) parts.push(`hasta el ${dateFormatter.format(toDate(endsAt))}`)
  return parts.join(' ')
}

export default async function PromotionsPage({ params }: Props) {
  const { slug } = await params
  const business = await resolveBusinessBySlug(slug)

  // Guarda de módulo — respeta overrides por tenant
  const promoModule = resolvePageModule(business, 'promotions')
  if (!promoModule.enabled) notFound()

  // Traemos todas — activas e inactivas — para mostrar el estado visual completo
  const allPromos = await getPromotions()
  const today = new Date()

  const enriched = allPromos.map((promo) => {
    const status: PromoStatus = getPromotionStatus(promo, today)
    const dateRange = formatDateRange(promo.startsAt, promo.endsAt)
    const orderHref = business?.whatsapp
      ? getWhatsAppUrl(`Hola ${business.name}, quisiera aprovechar la oferta: ${promo.title}.`, business.whatsapp)
      : undefined
    return { promo, status, dateRange, orderHref }
  })

  const activeCount = enriched.filter((e) => e.status === 'active').length

  return (
    <>
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <Section bg="secondary" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            {promoModule.title}
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            {activeCount > 0
              ? `${activeCount} promoción${activeCount > 1 ? 'es' : ''} activa${activeCount > 1 ? 's' : ''} ahora mismo.`
              : promoModule.emptyMessage}
          </p>
        </div>
      </Section>

      {/* ── Listado ────────────────────────────────────────────────── */}
      {enriched.length === 0 ? (
        <Section bg="default" size="lg">
          <p className="text-center" style={{ color: 'var(--color-text-subtle)' }}>
            No hay promociones registradas en este momento.
          </p>
        </Section>
      ) : (
        <Section bg="default" size="md">
          <ul className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {enriched.map(({ promo, status, dateRange, orderHref }) => (
              <li key={promo.id}>
                <PromotionCard
                  promotion={promo}
                  status={status}
                  dateRange={dateRange}
                  orderHref={orderHref}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── CTA WhatsApp ───────────────────────────────────────────── */}
      {business?.whatsapp && promoModule.cta && (
        <CtaWhatsappSection
          title={promoModule.cta.title}
          subtitle={promoModule.cta.subtitle}
          buttonLabel={promoModule.cta.buttonLabel}
          message={promoModule.cta.message}
          phoneNumber={business.whatsapp}
          bg="secondary"
          size="md"
        />
      )}
    </>
  )
}
