'use client'

import Link from 'next/link'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { useAdminForm } from '@/components/admin/useAdminForm'
import { createBusinessAction } from '../actions'

// ─── Formulario ──────────────────────────────────────────────────────────────

export function BusinessCreateForm() {
  const { state, formAction, fieldError } = useAdminForm(createBusinessAction)

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state && !state.ok && !state.field && (
        <AdminAlert type="error" message={state.error} />
      )}

      {/* Información básica */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Información básica
        </h2>

        {/* Nombre */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nombre del negocio <span className="text-red-500">*</span>
          </label>
          <input
            type="text" id="name" name="name"
            required maxLength={200} autoFocus
            className={fieldInputCls(!!fieldError('name'))}
          />
          {fieldError('name') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('name')}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label htmlFor="slug" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text" id="slug" name="slug"
            required maxLength={100}
            placeholder="cafe-la-esquina"
            className={fieldInputCls(!!fieldError('slug'))}
          />
          {fieldError('slug') ? (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('slug')}</p>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Solo minúsculas, números y guiones. Define la URL del negocio: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">/negocios/[slug]</code>
            </p>
          )}
        </div>

        {/* Descripción corta */}
        <div className="space-y-1.5">
          <label htmlFor="shortDescription" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Descripción corta <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <textarea
            id="shortDescription" name="shortDescription"
            rows={2} maxLength={300}
            className={fieldInputCls()}
          />
        </div>

        {/* isActive */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox" id="isActive" name="isActive"
            defaultChecked
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Negocio activo (visible en el directorio)
          </label>
        </div>
      </section>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <SubmitButton label="Crear negocio" pendingLabel="Creando..." />
        <Link
          href="/superadmin/businesses"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
