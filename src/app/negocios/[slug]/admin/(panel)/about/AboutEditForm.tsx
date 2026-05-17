'use client'

import Link from 'next/link'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { useAdminForm } from '@/components/admin/useAdminForm'
import { updateAboutAction } from './actions'
import type { AboutContent } from '@/types'

// ─── Formulario ──────────────────────────────────────────────────────────────

interface Props { slug: string, about: AboutContent | null }

export function AboutEditForm({ slug, about }: Props) {
  const { state: updateState, formAction: updateFormAction, fieldError } = useAdminForm(
    updateAboutAction.bind(null, slug),
  )

  const storyText = about?.story?.join('\n') ?? ''
  const diffs     = about?.differentiators ?? []

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
      {updateState && !updateState.ok && !updateState.field && (
        <AdminAlert type="error" message={updateState.error} />
      )}
      <form action={updateFormAction} className="space-y-6" noValidate>

        {/* Campos */}
        <div className="space-y-1.5">
          <label htmlFor="story" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Historia <span className="text-red-500">*</span>
          </label>
          <textarea id="story" name="story" rows={6} required
            defaultValue={storyText}
            className={fieldInputCls(!!fieldError('story'))}
            placeholder="Escribe la historia del negocio. Cada línea se convierte en un párrafo." />
          {fieldError('story') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('story')}</p>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Cada línea = un párrafo en la página pública.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="mission" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Misión <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <textarea id="mission" name="mission" rows={3} maxLength={500}
            defaultValue={about?.mission ?? ''}
            className={fieldInputCls()} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="teamImageUrl" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            URL de imagen del equipo <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <input type="url" id="teamImageUrl" name="teamImageUrl" maxLength={1000}
            defaultValue={about?.teamImageUrl ?? ''}
            placeholder="https://..."
            className={fieldInputCls()} />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Diferenciadores <span className="text-zinc-400 font-normal">(hasta 5)</span>
          </p>
          {Array.from({ length: 5 }).map((_, i) => {
            const d = diffs[i]
            return (
              <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 space-y-3">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Diferenciador {i + 1}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor={`diff_title_${i}`} className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Título</label>
                    <input type="text" id={`diff_title_${i}`} name={`diff_title_${i}`}
                      maxLength={100} defaultValue={d?.title ?? ''} className={fieldInputCls()} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`diff_icon_${i}`} className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Ícono <span className="font-normal text-zinc-400">(opcional)</span>
                    </label>
                    <input type="text" id={`diff_icon_${i}`} name={`diff_icon_${i}`}
                      maxLength={50} defaultValue={d?.icon ?? ''} placeholder="ej: star"
                      className={fieldInputCls()} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor={`diff_desc_${i}`} className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Descripción</label>
                  <textarea id={`diff_desc_${i}`} name={`diff_desc_${i}`}
                    rows={2} maxLength={500} defaultValue={d?.description ?? ''}
                    className={fieldInputCls()} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Guardar cambios" pendingLabel="Guardando..." />
          <Link href={`/negocios/${slug}/admin`}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Cancelar
          </Link>
        </div>

      </form>
    </div>
  )
}
