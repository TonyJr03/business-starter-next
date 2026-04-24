'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { SubmitButton } from '@/components/admin/SubmitButton'
import { createProductAction } from '../actions'
import type { AdminActionState } from '@/lib/admin'

interface Category {
  id: string
  name: string
}

interface Props {
  slug: string
  categories: Category[]
}

export function ProductNewForm({ slug, categories }: Props) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(
    createProductAction.bind(null, slug),
    null,
  )

  const fieldError = (field: string) =>
    state && !state.ok && state.field === field ? state.error : undefined

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
            maxLength={200}
            autoFocus
            className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors ${
              fieldError('name') ? 'border-red-400 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-700'
            }`}
          />
          {fieldError('name') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('name')}</p>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">El slug se genera automáticamente desde el nombre.</p>
        </div>

        {/* Categoría */}
        <div className="space-y-1.5">
          <label htmlFor="categoryId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors ${
              fieldError('categoryId') ? 'border-red-400 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-700'
            }`}
          >
            <option value="">Selecciona una categoría…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {fieldError('categoryId') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('categoryId')}</p>
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
            maxLength={1000}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors resize-none"
          />
        </div>

        {/* Precio + Divisa */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="moneyAmount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Precio <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="moneyAmount"
              name="moneyAmount"
              required
              min={0}
              step={0.01}
              defaultValue={0}
              className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors ${
                fieldError('moneyAmount') ? 'border-red-400 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-700'
              }`}
            />
            {fieldError('moneyAmount') && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('moneyAmount')}</p>
            )}
          </div>
          <div className="w-28 space-y-1.5">
            <label htmlFor="moneyCurrency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Divisa
            </label>
            <select
              id="moneyCurrency"
              name="moneyCurrency"
              defaultValue="CUP"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            >
              <option value="CUP">CUP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* Badge */}
        <div className="space-y-1.5">
          <label htmlFor="badge" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Badge <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <select
            id="badge"
            name="badge"
            className="w-40 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
          >
            <option value="">Sin badge</option>
            <option value="new">Nuevo</option>
            <option value="popular">Popular</option>
            <option value="offer">Oferta</option>
          </select>
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

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              defaultChecked
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
            <div>
              <label htmlFor="isAvailable" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                Disponible
              </label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Los productos no disponibles no aparecen en el catálogo.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
            <div>
              <label htmlFor="isFeatured" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                Destacado
              </label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Aparece en secciones especiales del catálogo.</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Crear producto" pendingLabel="Creando..." />
          <Link
            href={`/negocios/${slug}/admin/catalog/products`}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Cancelar
          </Link>
        </div>

      </form>
    </div>
  )
}
