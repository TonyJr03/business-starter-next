'use client'

import Link from 'next/link'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { useAdminForm } from '@/components/admin/useAdminForm'
import { createCatalogPageAction } from '../actions'

// ─── Formulario ──────────────────────────────────────────────────────────────

interface Props { slug: string }

export function CatalogPageNewForm({ slug }: Props) {
  const { state, formAction, fieldError } = useAdminForm(
    createCatalogPageAction.bind(null, slug),
  )

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
      {state && !state.ok && !state.field && (
        <AdminAlert type="error" message={state.error} />
      )}
      <form action={formAction} className="space-y-5" noValidate>

        {/* Campos */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input type="text" id="name" name="name" required maxLength={200} autoFocus
            className={fieldInputCls(!!fieldError('name'))} />
          {fieldError('name') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('name')}</p>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">El slug se genera automáticamente desde el nombre.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Descripción <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <textarea id="description" name="description" rows={3} maxLength={500}
            className={fieldInputCls()} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sortOrder" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Orden</label>
          <input type="number" id="sortOrder" name="sortOrder" defaultValue={0} min={0}
            className="w-28 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors" />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="isActive" name="isActive" defaultChecked
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100" />
          <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">Activo</label>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Crear catálogo" pendingLabel="Creando..." />
          <Link href={`/negocios/${slug}/admin/catalog`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
            Cancelar
          </Link>
        </div>

      </form>
    </div>
  )
}
