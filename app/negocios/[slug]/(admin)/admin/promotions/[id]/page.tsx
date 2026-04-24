/**
 * /negocios/[slug]/admin/promotions/[id] — Editar/eliminar promoción
 *
 * Server Component: carga la promoción y la pasa al formulario cliente.
 * Si el id no pertenece al negocio autenticado → 404.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'
import { PromotionEditForm } from './PromotionEditForm'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

/** Convierte un TIMESTAMPTZ de Supabase al formato datetime-local (YYYY-MM-DDTHH:mm) */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default async function EditPromotionPage({ params }: Props) {
  const { slug, id } = await params

  const ctxResult = await getAdminContext(slug)
  if (!ctxResult.ok) notFound()
  const { ctx } = ctxResult

  const { data: row } = await ctx.supabase
    .from('promotions')
    .select('id, title, description, status, discount_label, starts_at, ends_at, rules, sort_order')
    .eq('id', id)
    .eq('business_id', ctx.businessId) // RLS: solo el negocio propietario
    .single()

  if (!row) notFound()

  // Extraer la primera regla del array rules[] si existe
  const firstRule = Array.isArray(row.rules) && row.rules.length > 0 ? row.rules[0] : null

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link
          href={`/negocios/${slug}/admin/promotions`}
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          ← Volver a promociones
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-3">
          Editar promoción
        </h1>
      </div>

      <PromotionEditForm
        slug={slug}
        promotion={{
          id:              row.id,
          title:           row.title,
          description:     row.description ?? '',
          status:          row.status,
          discountLabel:   row.discount_label ?? '',
          startsAt:        toDatetimeLocal(row.starts_at),
          endsAt:          toDatetimeLocal(row.ends_at),
          sortOrder:       row.sort_order,
          ruleType:        firstRule?.type        ?? '',
          ruleValue:       firstRule?.value       ?? '',
          ruleDescription: firstRule?.description ?? '',
        }}
      />
    </div>
  )
}
