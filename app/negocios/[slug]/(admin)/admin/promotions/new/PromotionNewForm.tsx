'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { SubmitButton } from '@/components/admin/SubmitButton'
import { createPromotionAction } from '../actions'
import type { AdminActionState } from '@/lib/admin'

interface Props {
  slug: string
}

export function PromotionNewForm({ slug }: Props) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(
    createPromotionAction.bind(null, slug),
    null,
  )

  const fieldError = (field: string) =>
    state && !state.ok && state.field === field ? state.error : undefined

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">

      {/* Error general */}
      {state && !state.ok && !state.field && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5" noValidate>

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
            defaultValue="active"
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
              className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors ${
                fieldError('endsAt') ? 'border-red-400 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-700'
              }`}
            />
            {fieldError('endsAt') && (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('endsAt')}</p>
            )}
          </div>
        </div>

        {/* Separador — Regla simple */}
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
                placeholder="0"
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
            defaultValue={0}
            min={0}
            className="w-28 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label="Crear promoción" pendingLabel="Creando..." />
          <Link
            href={`/negocios/${slug}/admin/promotions`}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Cancelar
          </Link>
        </div>

      </form>
    </div>
  )
}
