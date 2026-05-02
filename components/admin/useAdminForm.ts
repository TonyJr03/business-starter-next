'use client'

import { useActionState } from 'react'
import type { AdminActionState } from '@/lib/admin'

type BoundAction = (prevState: AdminActionState, formData: FormData) => Promise<AdminActionState>

/**
 * Encapsula el boilerplate de useActionState + fieldError para todos los
 * formularios del panel de administración.
 *
 * @param action — Server Action ya enlazada con .bind(null, slug, ...ids)
 *
 * @example
 *   const { state, formAction, fieldError } = useAdminForm(
 *     createFaqItemAction.bind(null, slug)
 *   )
 */
export function useAdminForm(action: BoundAction) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(action, null)

  const fieldError = (field: string): string | undefined =>
    state && !state.ok && state.field === field ? state.error : undefined

  return { state, formAction, fieldError }
}
