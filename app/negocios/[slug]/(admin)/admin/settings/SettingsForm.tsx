'use client'

import { useActionState } from 'react'
import { SubmitButton } from '@/components/admin/SubmitButton'
import { updateSettingsAction } from './actions'
import type { AdminActionState } from '@/lib/admin'
import type { DayHours } from '@/types'
import { globalConfig } from '@/config'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const

interface Defaults {
  name: string
  shortDescription: string
  whatsapp: string
  phone: string
  email: string
  address: string
  city: string
  country: string
  socialInstagram: string
  socialFacebook: string
  socialTelegram: string
  socialTwitter: string
  socialYoutube: string
  hours: DayHours[] | null
}

interface Props {
  slug: string
  defaults: Defaults
}

export function SettingsForm({ slug, defaults }: Props) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(
    updateSettingsAction.bind(null, slug),
    null,
  )

  const fieldError = (field: string) =>
    state && !state.ok && state.field === field ? state.error : undefined

  return (
    <form action={formAction} className="space-y-8" noValidate>

      {/* Error general */}
      {state && !state.ok && !state.field && (
        <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200" role="alert">
          {state.error}
        </div>
      )}

      {/* ── Información básica ── */}
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Información básica
        </h2>

        {/* Nombre */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nombre del negocio <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={200}
            defaultValue={defaults.name}
            autoFocus
            className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors ${
              fieldError('name') ? 'border-red-400 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-700'
            }`}
          />
          {fieldError('name') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('name')}</p>
          )}
        </div>

        {/* Descripción corta */}
        <div className="space-y-1.5">
          <label htmlFor="shortDescription" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Descripción corta <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            rows={2}
            maxLength={300}
            defaultValue={defaults.shortDescription}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors resize-none"
          />
          {fieldError('shortDescription') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('shortDescription')}</p>
          )}
        </div>
      </section>

      {/* ── Contacto ── */}
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Contacto
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="space-y-1.5">
            <label htmlFor="whatsapp" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              WhatsApp
            </label>
            <input
              type="text"
              id="whatsapp"
              name="whatsapp"
              maxLength={30}
              defaultValue={defaults.whatsapp}
              placeholder="+53 5 000 0000"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Teléfono
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              maxLength={30}
              defaultValue={defaults.phone}
              placeholder="+53 7 000 0000"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            maxLength={200}
            defaultValue={defaults.email}
            placeholder="contacto@negocio.com"
            className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors ${
              fieldError('email') ? 'border-red-400 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-700'
            }`}
          />
          {fieldError('email') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('email')}</p>
          )}
        </div>
      </section>

      {/* ── Ubicación ── */}
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Ubicación
        </h2>

        <div className="space-y-1.5">
          <label htmlFor="address" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Dirección
          </label>
          <input
            type="text"
            id="address"
            name="address"
            maxLength={300}
            defaultValue={defaults.address}
            placeholder="Calle Obispo 123"
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="space-y-1.5">
            <label htmlFor="city" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Ciudad
            </label>
            <input
              type="text"
              id="city"
              name="city"
              maxLength={100}
              defaultValue={defaults.city}
              placeholder="La Habana"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="country" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              País
            </label>
            <input
              type="text"
              id="country"
              name="country"
              maxLength={100}
              defaultValue={defaults.country}
              placeholder="Cuba"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

        </div>
      </section>

      {/* ── Redes sociales ── */}
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Redes sociales
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Introduce la URL completa o solo el nombre de usuario.
        </p>

        {(
          [
            { id: 'socialInstagram', name: 'socialInstagram', label: 'Instagram', defaultValue: defaults.socialInstagram, placeholder: '@cafe_la_esquina' },
            { id: 'socialFacebook',  name: 'socialFacebook',  label: 'Facebook',  defaultValue: defaults.socialFacebook,  placeholder: 'facebook.com/cafe' },
            { id: 'socialTelegram',  name: 'socialTelegram',  label: 'Telegram',  defaultValue: defaults.socialTelegram,  placeholder: '@cafe_la_esquina' },
            { id: 'socialTwitter',   name: 'socialTwitter',   label: 'Twitter / X', defaultValue: defaults.socialTwitter, placeholder: '@cafe_la_esquina' },
            { id: 'socialYoutube',   name: 'socialYoutube',   label: 'YouTube',   defaultValue: defaults.socialYoutube,   placeholder: 'youtube.com/@cafe' },
          ] as const
        ).map((field) => (
          <div key={field.id} className="flex items-center gap-3">
            <label htmlFor={field.id} className="w-28 shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {field.label}
            </label>
            <input
              type="text"
              id={field.id}
              name={field.name}
              maxLength={200}
              defaultValue={field.defaultValue}
              placeholder={field.placeholder}
              className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>
        ))}
      </section>

      {/* ── Horarios de atención ── */}
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Horarios de atención
        </h2>

        <div className="space-y-3">
          {/* Cabecera */}
          <div className="hidden sm:grid sm:grid-cols-[8rem_1fr_1fr_5rem] gap-2 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
            <span>Día</span>
            <span>Apertura</span>
            <span>Cierre</span>
            <span className="text-center">Cerrado</span>
          </div>

          {DAYS.map((day, i) => {
            const fallback = globalConfig.hours[i]
            const saved    = defaults.hours?.[i]
            const open     = saved?.open     ?? fallback?.open     ?? '09:00'
            const close    = saved?.close    ?? fallback?.close    ?? '18:00'
            const isClosed = saved?.isClosed ?? fallback?.isClosed ?? false

            return (
              <div key={day} className="grid grid-cols-2 sm:grid-cols-[8rem_1fr_1fr_5rem] gap-2 items-center">
                <span className="col-span-2 sm:col-span-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {day}
                </span>

                <div className="space-y-1">
                  <label className="sm:hidden text-xs text-zinc-400">Apertura</label>
                  <input
                    type="time"
                    name={`hours_open_${i}`}
                    defaultValue={open}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="sm:hidden text-xs text-zinc-400">Cierre</label>
                  <input
                    type="time"
                    name={`hours_close_${i}`}
                    defaultValue={close}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                  />
                </div>

                <div className="flex justify-center items-center gap-1.5">
                  <label className="sm:hidden text-xs text-zinc-400">Cerrado</label>
                  <input
                    type="checkbox"
                    name={`hours_closed_${i}`}
                    defaultChecked={isClosed}
                    className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Guardar */}
      <div className="flex items-center gap-3">
        <SubmitButton label="Guardar ajustes" pendingLabel="Guardando..." />
      </div>

    </form>
  )
}
