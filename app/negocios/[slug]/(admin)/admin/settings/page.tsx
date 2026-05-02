import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminAlert } from '@/components/admin/AdminAlert'
import type { DayHours } from '@/types'
import { SettingsEditForm } from './SettingsEditForm'

interface Props { params: Promise<{ slug: string }>, searchParams: Promise<Record<string, string | undefined>> }

export default async function SettingsPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('businesses')
    .select('name, short_description, whatsapp, phone, email, address, city, country, social, hours')
    .eq('id', ctx.businessId)
    .single()

  if (!row) notFound()

  const social = (row.social ?? {}) as Record<string, string>
  const hours = (row.hours ?? null) as DayHours[] | null

  return (
    <div className="space-y-6 max-w-xl">

      <AdminPageHeader
        title="Ajustes del negocio"
        description="Información básica visible en el catálogo público."
      />

      {sp.saved === '1' && <AdminAlert type="success" message="Ajustes guardados correctamente." />}

      <SettingsEditForm
        slug={slug}
        defaults={{
          name:             row.name,
          shortDescription: row.short_description ?? '',
          whatsapp:         row.whatsapp  ?? '',
          phone:            row.phone     ?? '',
          email:            row.email     ?? '',
          address:          row.address   ?? '',
          city:             row.city      ?? '',
          country:          row.country   ?? '',
          socialInstagram:  social.instagram  ?? '',
          socialFacebook:   social.facebook   ?? '',
          socialTelegram:   social.telegram   ?? '',
          socialTwitter:    social.twitter    ?? '',
          socialYoutube:    social.youtube    ?? '',
          hours,
        }}
      />

    </div>
  )
}
