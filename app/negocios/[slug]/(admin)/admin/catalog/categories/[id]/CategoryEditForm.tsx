'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { updateCategoryAction, deleteCategoryAction } from '../actions'
import type { AdminActionState } from '@/lib/admin'

interface CategoryData {
  id: string
  slug: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
}

interface Props {
  slug: string
  category: CategoryData
}

export function CategoryEditForm({ slug, category }: Props) {
  const [updateState, updateFormAction] = useActionState<AdminActionState, FormData>(
    updateCategoryAction.bind(null, slug, category.id),
    null,
  )

  const [deleteState, deleteFormAction] = useActionState<AdminActionState, FormData>(
    deleteCategoryAction.bind(null, slug, category.id),
    null,
  )

  const fieldError = (field: string) =>
    updateState && !updateState.ok && updateState.field === field ? updateState.error : undefined

  return (
    <div className="space-y-8">

      {/* ── Formulario de edición ── */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">

        {/* Error general de actualización */}
        {updateState && !updateState.ok && !updateState.field && (
          <AdminAlert type="error" message={updateState.error} />
        )}

        <form action={updateFormAction} className="space-y-5" noValidate>

          {/* Slug — readonly */}
          <div className="space-y-1.5">
            <label htmlFor="slug" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              value={category.slug}
              readOnly
              tabIndex={-1}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 font-mono cursor-not-allowed"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">El slug no puede modificarse para preservar las URLs.</p>
          </div>

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
              defaultValue={category.name}
              autoFocus
              className={fieldInputCls(!!fieldError('name'))}
            />
            {fieldError('name') && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('name')}</p>
            )}
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
              defaultValue={category.description}
              className={fieldInputCls()}
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
              defaultValue={category.sortOrder}
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
              defaultChecked={category.isActive}
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
            <SubmitButton label="Guardar cambios" pendingLabel="Guardando..." />
            <Link
              href={`/negocios/${slug}/admin/catalog/categories`}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Cancelar
            </Link>
          </div>

        </form>
      </div>

      {/* ── Zona de peligro: eliminar ── */}
      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-6">
        <h2 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
          Eliminar categoría
        </h2>
        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
          Esta acción no se puede deshacer. Los productos asociados a esta categoría no podrán eliminarse mientras existan.
        </p>

        {deleteState && !deleteState.ok && (
          <AdminAlert type="error" message={deleteState.error} />
        )}

        <form action={deleteFormAction}>
          <SubmitButton
            label="Eliminar categoría"
            pendingLabel="Eliminando..."
            variant="danger"
          />
        </form>
      </div>

    </div>
  )
}
