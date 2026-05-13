'use client'

import { AdminAlert } from '@/components/admin/AdminAlert'
import { AdminDeleteZone } from '@/components/admin/AdminDeleteZone'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { useAdminForm } from '@/components/admin/useAdminForm'
import { updateBusinessAction, deleteBusinessAction } from '../actions'
import type { BusinessSettings } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const

// ─── Formulario ──────────────────────────────────────────────────────────────

interface Props {
  businessId: string
  businessSettings: BusinessSettings
}

export function BusinessEditForm({ businessId, businessSettings }: Props) {
  const contact  = businessSettings.contact  ?? {}
  const location = businessSettings.location ?? {}
  const social   = businessSettings.social   ?? {}

  const { state, formAction, fieldError } = useAdminForm(
    updateBusinessAction.bind(null, businessId),
  )

  return (
    <>
    <form action={formAction} className="space-y-8" noValidate>
      {state && !state.ok && !state.field && (
        <AdminAlert type="error" message={state.error} />
      )}

      {/* Información básica */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Información básica
        </h2>

        {/* Slug (editable con advertencia) */}
        <div className="space-y-1.5">
          <label htmlFor="slug" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Slug
          </label>
          <input
            type="text" id="slug" name="slug"
            required maxLength={100}
            defaultValue={businessSettings.slug}
            className={fieldInputCls(!!fieldError('slug'))}
          />
          {fieldError('slug') ? (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('slug')}</p>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-500">
              ⚠ Cambiar el slug modifica la URL pública del negocio y rompe todos los enlaces existentes.
            </p>
          )}
        </div>

        {/* isActive */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox" id="isActive" name="isActive"
            defaultChecked={businessSettings.isActive}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Negocio activo (visible en el directorio)
          </label>
        </div>

        {/* Nombre */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nombre del negocio <span className="text-red-500">*</span>
          </label>
          <input
            type="text" id="name" name="name"
            required maxLength={200}
            defaultValue={businessSettings.name}
            className={fieldInputCls(!!fieldError('name'))}
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
            id="shortDescription" name="shortDescription"
            rows={2} maxLength={300}
            defaultValue={businessSettings.shortDescription}
            className={fieldInputCls(!!fieldError('shortDescription'))}
          />
          {fieldError('shortDescription') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('shortDescription')}</p>
          )}
        </div>
      </section>

      {/* Contacto */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Contacto
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="whatsapp" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              WhatsApp
            </label>
            <input
              type="text" id="whatsapp" name="whatsapp" maxLength={30}
              defaultValue={contact.whatsapp ?? ''} placeholder="+53 5 000 0000"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Teléfono
            </label>
            <input
              type="text" id="phone" name="phone" maxLength={30}
              defaultValue={contact.phone ?? ''} placeholder="+53 7 000 0000"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            type="email" id="email" name="email" maxLength={200}
            defaultValue={contact.email ?? ''} placeholder="contacto@negocio.com"
            className={fieldInputCls(!!fieldError('email'))}
          />
          {fieldError('email') && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">{fieldError('email')}</p>
          )}
        </div>
      </section>

      {/* Ubicación */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Ubicación
        </h2>

        <div className="space-y-1.5">
          <label htmlFor="address" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Dirección
          </label>
          <input
            type="text" id="address" name="address" maxLength={300}
            defaultValue={location.address ?? ''} placeholder="Calle Obispo 123"
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="city" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Ciudad
            </label>
            <input
              type="text" id="city" name="city" maxLength={100}
              defaultValue={location.city ?? ''} placeholder="La Habana"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="country" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              País
            </label>
            <input
              type="text" id="country" name="country" maxLength={100}
              defaultValue={location.country ?? ''} placeholder="Cuba"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Redes sociales */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Redes sociales
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Introduce la URL completa o solo el nombre de usuario.
        </p>

        {(
          [
            { id: 'socialInstagram', name: 'socialInstagram', label: 'Instagram', defaultValue: social.instagram ?? '', placeholder: '@negocio' },
            { id: 'socialFacebook',  name: 'socialFacebook',  label: 'Facebook',  defaultValue: social.facebook  ?? '', placeholder: 'facebook.com/negocio' },
            { id: 'socialTelegram',  name: 'socialTelegram',  label: 'Telegram',  defaultValue: social.telegram  ?? '', placeholder: '@negocio' },
            { id: 'socialTwitter',   name: 'socialTwitter',   label: 'Twitter / X', defaultValue: social.twitter ?? '', placeholder: '@negocio' },
            { id: 'socialYoutube',   name: 'socialYoutube',   label: 'YouTube',   defaultValue: social.youtube   ?? '', placeholder: 'youtube.com/@negocio' },
          ] as const
        ).map((field) => (
          <div key={field.id} className="flex items-center gap-3">
            <label htmlFor={field.id} className="w-28 shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {field.label}
            </label>
            <input
              type="text" id={field.id} name={field.name} maxLength={200}
              defaultValue={field.defaultValue} placeholder={field.placeholder}
              className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>
        ))}
      </section>

      {/* Horarios de atención */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Horarios de atención
        </h2>

        <div className="space-y-3">
          <div className="hidden sm:grid sm:grid-cols-[8rem_1fr_1fr_5rem] gap-2 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
            <span>Día</span>
            <span>Apertura</span>
            <span>Cierre</span>
            <span className="text-center">Cerrado</span>
          </div>

          {DAYS.map((day, i) => {
            const saved    = businessSettings.hours?.[i] ?? null
            const open     = saved?.open     ?? '09:00'
            const close    = saved?.close    ?? '18:00'
            const isClosed = saved?.isClosed ?? false

            return (
              <div key={day} className="grid grid-cols-2 sm:grid-cols-[8rem_1fr_1fr_5rem] gap-2 items-center">
                <span className="col-span-2 sm:col-span-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {day}
                </span>

                <div className="space-y-1">
                  <label className="sm:hidden text-xs text-zinc-400">Apertura</label>
                  <input
                    type="time" name={`hours_open_${i}`} defaultValue={open}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="sm:hidden text-xs text-zinc-400">Cierre</label>
                  <input
                    type="time" name={`hours_close_${i}`} defaultValue={close}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                  />
                </div>

                <div className="flex justify-center items-center gap-1.5">
                  <label className="sm:hidden text-xs text-zinc-400">Cerrado</label>
                  <input
                    type="checkbox" name={`hours_closed_${i}`} defaultChecked={isClosed}
                    className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <SubmitButton label="Guardar ajustes" pendingLabel="Guardando..." />
      </div>
    </form>

    <AdminDeleteZone
      title="Eliminar negocio"
      description="Esta acción eliminará permanentemente el negocio y todos sus datos. No se puede deshacer."
      label="Eliminar negocio"
      action={deleteBusinessAction.bind(null, businessId)}
    />
    </>
  )
}
