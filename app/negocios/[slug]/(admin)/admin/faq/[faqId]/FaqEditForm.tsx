'use client'

import Link from 'next/link'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { useAdminForm } from '@/components/admin/useAdminForm'
import { AdminDeleteZone } from '@/components/admin/AdminDeleteZone'
import { updateFaqItemAction, deleteFaqItemAction } from '../actions'

interface FaqData {
  id: string
  question: string
  answer: string
  category: string
  sortOrder: number
  isActive: boolean
}

interface Props { slug: string; item: FaqData }

export function FaqEditForm({ slug, item }: Props) {
  const { state: updateState, formAction: updateFormAction, fieldError } = useAdminForm(
    updateFaqItemAction.bind(null, slug, item.id),
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
            <label htmlFor="question" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Pregunta <span className="text-red-500">*</span>
            </label>
            <input type="text" id="question" name="question" required maxLength={500}
              defaultValue={item.question} autoFocus className={fieldInputCls(!!fieldError('question'))} />
            {fieldError('question') && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('question')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="answer" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Respuesta <span className="text-red-500">*</span>
            </label>
            <textarea id="answer" name="answer" rows={5} required maxLength={2000}
              defaultValue={item.answer} className={fieldInputCls(!!fieldError('answer'))} />
            {fieldError('answer') && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('answer')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Categoría <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <input type="text" id="category" name="category" maxLength={100}
              defaultValue={item.category} className={fieldInputCls()} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sortOrder" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Orden</label>
            <input type="number" id="sortOrder" name="sortOrder" defaultValue={item.sortOrder} min={0}
              className="w-28 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" name="isActive" defaultChecked={item.isActive}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100" />
            <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">Activa</label>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3 pt-2">
            <SubmitButton label="Guardar cambios" pendingLabel="Guardando..." />
            <Link href={`/negocios/${slug}/admin/faq`}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      <AdminDeleteZone
        title="Eliminar pregunta"
        description="Esta acción no se puede deshacer."
        label="Eliminar pregunta"
        action={deleteFaqItemAction.bind(null, slug, item.id)}
      />

    </div>
  )
}
