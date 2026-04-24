/**
 * /negocios/[slug]/admin/settings — Ajustes del negocio
 *
 * Server Component: carga los datos actuales del negocio y los pasa al formulario.
 */

import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { SettingsForm } from './SettingsForm'

interface Props {
  params:       Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function SettingsPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('businesses')
    .select('name, short_description, whatsapp, phone, email, address, city, country, social')
    .eq('id', ctx.businessId)
    .single()

  if (!row) notFound()

  const social = (row.social ?? {}) as Record<string, string>

  return (
    <div className="space-y-6 max-w-xl">

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Ajustes del negocio</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Información básica visible en el catálogo público.
        </p>
      </div>

      {sp.saved && (
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
          Ajustes guardados correctamente.
        </div>
      )}

      <SettingsForm
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
        }}
      />

    </div>
  )
}
