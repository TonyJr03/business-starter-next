'use client'

import Link from 'next/link'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { useAdminForm } from '@/components/admin/useAdminForm'
import { createPhotoAction } from '../actions'

interface Props { slug: string; albumId: string }

export function PhotoNewForm({ slug, albumId }: Props) {
  const { state, formAction, fieldError } = useAdminForm(
    createPhotoAction.bind(null, slug, albumId),
  )

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
      {state && !state.ok && !state.field && (
        <AdminAlert type="error" message={state.error} />
      )}
      <form action={formAction} className="space-y-5" noValidate>

        {/* Campos */}
        <div className="space-y-1.5">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            URL de imagen <span className="text-red-500">*</span>
          </label>
          <input type="url" id="imageUrl" name="imageUrl" required maxLength={1000} autoFocus
            placeholder="https://..." className={fieldInputCls(!!fieldError('imageUrl'))} />
          {fieldError('imageUrl') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('imageUrl')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="alt" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Texto alternativo <span className="text-red-500">*</span>
          </label>
          <input type="text" id="alt" name="alt" required maxLength={200}
            placeholder="Descripción de la imagen para accesibilidad"
            className={fieldInputCls(!!fieldError('alt'))} />
          {fieldError('alt') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('alt')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="caption" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Pie de foto <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <input type="text" id="caption" name="caption" maxLength={500} className={fieldInputCls()} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sortOrder" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Orden</label>
          <input type="number" id="sortOrder" name="sortOrder" defaultValue={0} min={0}
            className="w-28 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors" />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="isActive" name="isActive" defaultChecked
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100" />
          <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">Activa</label>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Añadir foto" pendingLabel="Añadiendo..." />
          <Link href={`/negocios/${slug}/admin/gallery/${albumId}/photos`}
            className="px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
            Cancelar
          </Link>
        </div>

      </form>
    </div>
  )
}
