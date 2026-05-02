'use client'

import { AdminAlert } from './AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { useAdminForm } from './useAdminForm'
import type { AdminActionState } from '@/lib/admin'

type BoundAction = (prevState: AdminActionState, formData: FormData) => Promise<AdminActionState>

interface Props {
  /** Título de la sección, ej: "Eliminar catálogo" */
  title: string
  /** Texto de advertencia bajo el título */
  description: string
  /** Label del botón de eliminar, ej: "Eliminar catálogo" */
  label: string
  /** Server Action ya enlazada con .bind(null, slug, id) */
  action: BoundAction
}

/**
 * Zona roja de eliminación que aparece al pie de todos los EditForms.
 * Maneja su propio estado de error independientemente del formulario principal.
 */
export function AdminDeleteZone({ title, description, label, action }: Props) {
  const { state, formAction } = useAdminForm(action)

  return (
    <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-6">
      <h2 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">{title}</h2>
      <p className="text-sm text-red-700 dark:text-red-400 mb-4">{description}</p>
      {state && !state.ok && <AdminAlert type="error" message={state.error} />}
      <form action={formAction}>
        <SubmitButton label={label} pendingLabel="Eliminando..." variant="danger" />
      </form>
    </div>
  )
}
