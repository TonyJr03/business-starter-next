'use client'

import Link from 'next/link'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { useAdminForm } from '@/components/admin/useAdminForm'
import { AdminDeleteZone } from '@/components/admin/AdminDeleteZone'
import { updatePostAction, deletePostAction } from '../actions'
import type { BlogPost } from '@/types'

// ─── Formulario ──────────────────────────────────────────────────────────────

interface Props { slug: string; post: BlogPost }

export function BlogEditForm({ slug, post }: Props) {
  const { state: updateState, formAction: updateFormAction, fieldError } = useAdminForm(
    updatePostAction.bind(null, slug, post.id),
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
            <input type="text" value={post.slug} readOnly tabIndex={-1}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 font-mono cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Título <span className="text-red-500">*</span>
            </label>
            <input type="text" id="title" name="title" required maxLength={300}
              defaultValue={post.title} autoFocus className={fieldInputCls(!!fieldError('title'))} />
            {fieldError('title') && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('title')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="summary" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Resumen <span className="text-red-500">*</span>
            </label>
            <textarea id="summary" name="summary" rows={2} required maxLength={500}
              defaultValue={post.summary} className={fieldInputCls(!!fieldError('summary'))} />
            {fieldError('summary') && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('summary')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="body" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Contenido <span className="text-red-500">*</span>
            </label>
            <textarea id="body" name="body" rows={10} required
              defaultValue={post.body.join('\n')}
              className={fieldInputCls(!!fieldError('body'))} />
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
              <input type="date" id="publishedAt" name="publishedAt" required
                defaultValue={post.publishedAt} className={fieldInputCls(!!fieldError('publishedAt'))} />
              {fieldError('publishedAt') && (
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('publishedAt')}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="author" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Autor <span className="text-zinc-400 font-normal">(opcional)</span>
              </label>
              <input type="text" id="author" name="author" maxLength={100}
                defaultValue={post.author} className={fieldInputCls()} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tags" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Etiquetas <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <input type="text" id="tags" name="tags" placeholder="ej: novedades, recetas, tips"
              defaultValue={post.tags.join(', ')} className={fieldInputCls()} />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Separadas por coma.</p>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isPublished" name="isPublished" defaultChecked={post.isPublished}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100" />
            <label htmlFor="isPublished" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">Publicado</label>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3 pt-2">
            <SubmitButton label="Guardar cambios" pendingLabel="Guardando..." />
            <Link href={`/negocios/${slug}/admin/blog`}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      <AdminDeleteZone
        title="Eliminar artículo"
        description="Esta acción no se puede deshacer."
        label="Eliminar artículo"
        action={deletePostAction.bind(null, slug, post.id)}
      />

    </div>
  )
}
