'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { SubmitButton } from '@/components/admin/SubmitButton'
import { updatePromotionAction, deletePromotionAction } from '../actions'
import type { AdminActionState } from '@/lib/admin'

interface PromotionData {
  id: string
  title: string
  description: string
  status: string
  discountLabel: string
  startsAt: string
  endsAt: string
  sortOrder: number
  ruleType: string
  ruleValue: number | string
  ruleDescription: string
}

interface Props {
  slug: string
  promotion: PromotionData
}

export function PromotionEditForm({ slug, promotion }: Props) {
  const [updateState, updateFormAction] = useActionState<AdminActionState, FormData>(
    updatePromotionAction.bind(null, slug, promotion.id),
    null,
  )

  const [deleteState, deleteFormAction] = useActionState<AdminActionState, FormData>(
    deletePromotionAction.bind(null, slug, promotion.id),
    null,
  )

  const fieldError = (field: string) =>
    updateState && !updateState.ok && updateState.field === field ? updateState.error : undefined

  return (
    <div className="space-y-8">

      {/* ── Formulario de edición ── */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">

        {/* Error general */}
        {updateState && !updateState.ok && !updateState.field && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200" role="alert">
            {updateState.error}
          </div>
        )}

        <form action={updateFormAction} className="space-y-5" noValidate>

          {/* Título */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              maxLength={200}
              defaultValue={promotion.title}
              autoFocus
              className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors ${
                fieldError('title') ? 'border-red-400 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-700'
              }`}
            />
            {fieldError('title') && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('title')}</p>
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
              defaultValue={promotion.description}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors resize-none"
            />
          </div>

          {/* Estado */}
          <div className="space-y-1.5">
            <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Estado
            </label>
            <select
              id="status"
              name="status"
              defaultValue={promotion.status}
              className="w-40 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            >
              <option value="active">Activa</option>
              <option value="upcoming">Próxima</option>
              <option value="paused">Pausada</option>
              <option value="expired">Expirada</option>
            </select>
          </div>

          {/* Etiqueta de descuento */}
          <div className="space-y-1.5">
            <label htmlFor="discountLabel" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Etiqueta de descuento <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              id="discountLabel"
              name="discountLabel"
              maxLength={50}
              defaultValue={promotion.discountLabel}
              placeholder="ej. 20% OFF, 2×1, Gratis envío"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

          {/* Fechas */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <label htmlFor="startsAt" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Inicio <span className="text-zinc-400 font-normal">(opcional)</span>
              </label>
              <input
                type="datetime-local"
                id="startsAt"
                name="startsAt"
                defaultValue={promotion.startsAt}
                className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors ${
                  fieldError('startsAt') ? 'border-red-400 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-700'
                }`}
              />
              {fieldError('startsAt') && (
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('startsAt')}</p>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <label htmlFor="endsAt" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Fin <span className="text-zinc-400 font-normal">(opcional)</span>
              </label>
              <input
                type="datetime-local"
                id="endsAt"
                name="endsAt"
                defaultValue={promotion.endsAt}
                className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors ${
                  fieldError('endsAt') ? 'border-red-400 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-700'
                }`}
              />
              {fieldError('endsAt') && (
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('endsAt')}</p>
              )}
            </div>
          </div>

          {/* Regla simple */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Regla de descuento <span className="font-normal normal-case">(opcional)</span>
            </p>

            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <label htmlFor="ruleType" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tipo
                </label>
                <select
                  id="ruleType"
                  name="ruleType"
                  defaultValue={promotion.ruleType}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                >
                  <option value="">Sin regla</option>
                  <option value="percentage">Porcentaje</option>
                  <option value="fixed">Monto fijo</option>
                  <option value="bogo">2×1 (BOGO)</option>
                  <option value="combo">Combo</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <div className="w-28 space-y-1.5">
                <label htmlFor="ruleValue" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Valor
                </label>
                <input
                  type="number"
                  id="ruleValue"
                  name="ruleValue"
                  min={0}
                  step={0.01}
                  defaultValue={String(promotion.ruleValue)}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ruleDescription" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Descripción de la regla
              </label>
              <input
                type="text"
                id="ruleDescription"
                name="ruleDescription"
                maxLength={300}
                defaultValue={promotion.ruleDescription}
                placeholder="ej. Aplica a cafés a partir de las 15:00"
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
              />
            </div>
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
              defaultValue={promotion.sortOrder}
              min={0}
              className="w-28 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3 pt-2">
            <SubmitButton label="Guardar cambios" pendingLabel="Guardando..." />
            <Link
              href={`/negocios/${slug}/admin/promotions`}
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
          Eliminar promoción
        </h2>
        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
          Esta acción no se puede deshacer.
        </p>

        {deleteState && !deleteState.ok && (
          <div className="mb-4 rounded-md bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 px-4 py-3 text-sm text-red-800 dark:text-red-200" role="alert">
            {deleteState.error}
          </div>
        )}

        <form action={deleteFormAction}>
          <SubmitButton
            label="Eliminar promoción"
            pendingLabel="Eliminando..."
            variant="danger"
          />
        </form>
      </div>

    </div>
  )
}
