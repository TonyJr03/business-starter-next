'use client'

import Link from 'next/link'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { useAdminForm } from '@/components/admin/useAdminForm'
import { createPostAction } from '../actions'

// ─── Formulario ──────────────────────────────────────────────────────────────

interface Props { slug: string }

export function BlogNewForm({ slug }: Props) {
  const { state, formAction, fieldError } = useAdminForm(
    createPostAction.bind(null, slug),
  )

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
      {state && !state.ok && !state.field && (
        <AdminAlert type="error" message={state.error} />
      )}
      <form action={formAction} className="space-y-5" noValidate>

        {/* Campos */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Título <span className="text-red-500">*</span>
          </label>
          <input type="text" id="title" name="title" required maxLength={300} autoFocus
            className={fieldInputCls(!!fieldError('title'))} />
          {fieldError('title') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('title')}</p>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">El slug se genera automáticamente desde el título.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="summary" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Resumen <span className="text-red-500">*</span>
          </label>
          <textarea id="summary" name="summary" rows={2} required maxLength={500}
            className={fieldInputCls(!!fieldError('summary'))} />
          {fieldError('summary') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('summary')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="body" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Contenido <span className="text-red-500">*</span>
          </label>
          <textarea id="body" name="body" rows={10} required
            className={fieldInputCls(!!fieldError('body'))}
            placeholder="Escribe el artículo aquí. Cada línea se convierte en un párrafo." />
          {fieldError('body') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('body')}</p>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Cada línea = un párrafo.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="publishedAt" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Fecha de publicación <span className="text-red-500">*</span>
            </label>
            <input type="date" id="publishedAt" name="publishedAt" required defaultValue={today}
              className={fieldInputCls(!!fieldError('publishedAt'))} />
            {fieldError('publishedAt') && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('publishedAt')}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="author" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Autor <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <input type="text" id="author" name="author" maxLength={100} className={fieldInputCls()} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="tags" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Etiquetas <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <input type="text" id="tags" name="tags" placeholder="ej: novedades, recetas, tips"
            className={fieldInputCls()} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Separadas por coma.</p>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="isPublished" name="isPublished" defaultChecked
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100" />
          <label htmlFor="isPublished" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">Publicado</label>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Crear artículo" pendingLabel="Creando..." />
          <Link href={`/negocios/${slug}/admin/blog`}
            className="px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
            Cancelar
          </Link>
        </div>

      </form>
    </div>
  )
}
