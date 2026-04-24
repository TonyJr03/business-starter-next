'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { SubmitButton } from '@/components/admin/SubmitButton'
import { createCategoryAction } from '../actions'
import type { AdminActionState } from '@/lib/admin'

interface Props {
  slug: string
}

export function CategoryNewForm({ slug }: Props) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(
    createCategoryAction.bind(null, slug),
    null,
  )

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">

      {/* Error general */}
      {state && !state.ok && !state.field && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5" noValidate>

        {/* Nombre */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={100}
            autoFocus
            className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors ${
              state && !state.ok && state.field === 'name'
                ? 'border-red-400 dark:border-red-600'
                : 'border-zinc-300 dark:border-zinc-700'
            }`}
          />
          {state && !state.ok && state.field === 'name' && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{state.error}</p>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">El slug se genera automáticamente desde el nombre.</p>
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Descripción <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors resize-none"
          />
        </div>

        {/* Orden */}
        <div className="space-y-1.5">
          <label htmlFor="sortOrder" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Orden
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            defaultValue={0}
            min={0}
            className="w-28 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Menor número aparece primero en el catálogo.</p>
        </div>

        {/* Activa */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            defaultChecked
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          />
          <div>
            <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              Activa
            </label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Las categorías inactivas no aparecen en el catálogo público.</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Crear categoría" pendingLabel="Creando..." />
          <Link
            href={`/negocios/${slug}/admin/catalog/categories`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            Cancelar
          </Link>
        </div>

      </form>
    </div>
  )
}
