'use client'

import Link from 'next/link'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { useAdminForm } from '@/components/admin/useAdminForm'
import { AdminDeleteZone } from '@/components/admin/AdminDeleteZone'
import { updateProductAction, deleteProductAction } from '../actions'

interface ProductData {
  id: string
  slug: string
  name: string
  description: string
  moneyAmount: number
  moneyCurrency: string
  isAvailable: boolean
  isFeatured: boolean
  badge: string | null
  sortOrder: number
}

interface Props { slug: string; catalogId: string; categoryId: string; product: ProductData }

export function ProductEditForm({ slug, catalogId, categoryId, product }: Props) {
  const { state: updateState, formAction: updateFormAction, fieldError } = useAdminForm(
    updateProductAction.bind(null, slug, catalogId, categoryId, product.id),
  )

  return (
    <div className="space-y-8">

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        {updateState && !updateState.ok && !updateState.field && (
          <AdminAlert type="error" message={updateState.error} />
        )}
        <form action={updateFormAction} className="space-y-5" noValidate>

          {/* Campos */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Slug</label>
            <input type="text" value={product.slug} readOnly tabIndex={-1}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 font-mono cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input type="text" id="name" name="name" required maxLength={200}
              defaultValue={product.name} autoFocus className={fieldInputCls(!!fieldError('name'))} />
            {fieldError('name') && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('name')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Descripción <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <textarea id="description" name="description" rows={3} maxLength={1000}
              defaultValue={product.description} className={fieldInputCls()} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="moneyAmount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Precio <span className="text-red-500">*</span>
              </label>
              <input type="number" id="moneyAmount" name="moneyAmount"
                defaultValue={product.moneyAmount} min={0} step={0.01}
                className={fieldInputCls(!!fieldError('moneyAmount'))} />
              {fieldError('moneyAmount') && (
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('moneyAmount')}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="moneyCurrency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Moneda</label>
              <input type="text" id="moneyCurrency" name="moneyCurrency"
                defaultValue={product.moneyCurrency} maxLength={3} className={fieldInputCls()} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="badge" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Badge <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <select id="badge" name="badge" defaultValue={product.badge ?? ''}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors">
              <option value="">Sin badge</option>
              <option value="new">Nuevo</option>
              <option value="popular">Popular</option>
              <option value="offer">Oferta</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sortOrder" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Orden</label>
            <input type="number" id="sortOrder" name="sortOrder" defaultValue={product.sortOrder} min={0}
              className="w-28 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors" />
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isAvailable" name="isAvailable" defaultChecked={product.isAvailable}
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100" />
              <label htmlFor="isAvailable" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">Disponible</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isFeatured" name="isFeatured" defaultChecked={product.isFeatured}
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100" />
              <label htmlFor="isFeatured" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">Destacado</label>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3 pt-2">
            <SubmitButton label="Guardar cambios" pendingLabel="Guardando..." />
            <Link href={`/negocios/${slug}/admin/catalog/${catalogId}/categories/${categoryId}/products`}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      <AdminDeleteZone
        title="Eliminar producto"
        description="Esta acción no se puede deshacer."
        label="Eliminar producto"
        action={deleteProductAction.bind(null, slug, catalogId, categoryId, product.id)}
      />

    </div>
  )
}
