'use client'

import { useState } from 'react'
import { platformDefaults } from '@/config/platform-defaults'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { useAdminForm } from '@/components/admin/useAdminForm'
import { updateModulesAction } from './actions'
import type { ModulesConfig, SectionModuleId, PageModuleId, FeatureModuleId } from '@/types'

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_IDS: PageModuleId[] = ['catalog', 'promotions', 'about', 'contact', 'faq', 'gallery', 'blog']
const SECTION_IDS: SectionModuleId[] = ['highlights', 'promotions', 'hours', 'whatsapp_cta', 'location']
const FEATURE_IDS: FeatureModuleId[] = ['cart', 'whatsappOrdering']

const PAGE_LABELS: Record<PageModuleId, string> = {
  catalog: 'Catálogo',
  promotions: 'Promociones',
  about: 'Nosotros',
  contact: 'Contacto',
  faq: 'FAQ',
  gallery: 'Galería',
  blog: 'Blog',
}

const SECTION_LABELS: Record<SectionModuleId, string> = {
  highlights: 'Destacados',
  promotions: 'Promociones (home)',
  hours: 'Horarios',
  whatsapp_cta: 'WhatsApp CTA',
  location: 'Ubicación',
}

const FEATURE_LABELS: Record<FeatureModuleId, string> = {
  cart: 'Carrito de compras',
  whatsappOrdering: 'Pedidos por WhatsApp',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const defaults = platformDefaults.modules

/** Devuelve un punto ámbar si el valor efectivo difiere del default de plataforma. */
function OverrideDot({ actual, def }: { actual: unknown; def: unknown }) {
  const aEmpty = actual === undefined || actual === ''
  const dEmpty = def === undefined || def === ''
  if (aEmpty && dEmpty) return null
  if (actual === def) return null
  return (
    <span className="ml-1 text-amber-500 text-xs" title="Valor personalizado (distinto al global)">
      ●
    </span>
  )
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface Props {
  businessId: string
  /** Valores efectivos: defaults de plataforma + overrides del tenant aplicados. */
  resolved: ModulesConfig
}

type SectionItem = { id: SectionModuleId; order: number }

// ─── Componente ───────────────────────────────────────────────────────────────

export function ModulesEditor({ businessId, resolved }: Props) {
  const { state, formAction } = useAdminForm(updateModulesAction.bind(null, businessId))

  // Estado local para el orden de secciones (drag-free: botones ↑/↓)
  const [sectionItems, setSectionItems] = useState<SectionItem[]>(() =>
    SECTION_IDS.map((id) => ({ id, order: resolved.sections[id].order })).sort(
      (a, b) => a.order - b.order,
    ),
  )

  function moveUp(idx: number) {
    if (idx === 0) return
    setSectionItems((prev) => {
      const next = prev.map((item) => ({ ...item }))
      ;[next[idx - 1].order, next[idx].order] = [next[idx].order, next[idx - 1].order]
      return next.slice().sort((a, b) => a.order - b.order)
    })
  }

  function moveDown(idx: number) {
    if (idx === sectionItems.length - 1) return
    setSectionItems((prev) => {
      const next = prev.map((item) => ({ ...item }))
      ;[next[idx].order, next[idx + 1].order] = [next[idx + 1].order, next[idx].order]
      return next.slice().sort((a, b) => a.order - b.order)
    })
  }

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state && !state.ok && (
        <AdminAlert type="error" message={state.error ?? 'Error desconocido'} />
      )}

      {/* ── Módulos de página ──────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Módulos de página
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Activa páginas del negocio y personaliza sus textos.
          </p>
        </div>

        {PAGE_IDS.map((id) => {
          const cfg = resolved.pages[id]
          const def = defaults.pages[id]
          const hasContentOverride =
            cfg.title !== def.title ||
            cfg.subtitle !== def.subtitle ||
            cfg.navLabel !== def.navLabel ||
            cfg.featuredTitle !== def.featuredTitle ||
            cfg.emptyMessage !== def.emptyMessage

          return (
            <details
              key={id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            >
              <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none [list-style:none] [&::-webkit-details-marker]:hidden">
                <input
                  type="checkbox"
                  name={`pages.${id}.enabled`}
                  defaultChecked={cfg.enabled}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 shrink-0 rounded border-zinc-300 dark:border-zinc-700 focus:ring-zinc-900 cursor-pointer"
                />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex-1">
                  {PAGE_LABELS[id]}
                  {(cfg.enabled !== def.enabled || hasContentOverride) && (
                    <span className="ml-1 text-amber-500 text-xs">●</span>
                  )}
                </span>
                <span className="text-xs text-zinc-400 font-mono">{def.path}</span>
                <span className="text-zinc-400 text-xs ml-2">▾</span>
              </summary>

              <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-4 space-y-4">
                {/* navLabel */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center">
                    Etiqueta de menú
                    <OverrideDot actual={cfg.navLabel} def={def.navLabel} />
                  </label>
                  <input
                    type="text"
                    name={`pages.${id}.navLabel`}
                    defaultValue={cfg.navLabel}
                    maxLength={60}
                    required
                    className={fieldInputCls()}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* title */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center">
                      Título (H1)
                      <OverrideDot actual={cfg.title} def={def.title} />
                    </label>
                    <input
                      type="text"
                      name={`pages.${id}.title`}
                      defaultValue={cfg.title ?? ''}
                      maxLength={200}
                      placeholder={def.title ?? '—'}
                      className={fieldInputCls()}
                    />
                  </div>

                  {/* subtitle */}
                  {'subtitle' in def && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center">
                        Subtítulo
                        <OverrideDot actual={cfg.subtitle} def={def.subtitle} />
                      </label>
                      <input
                        type="text"
                        name={`pages.${id}.subtitle`}
                        defaultValue={cfg.subtitle ?? ''}
                        maxLength={300}
                        placeholder={def.subtitle ?? '—'}
                        className={fieldInputCls()}
                      />
                    </div>
                  )}
                </div>

                {/* featuredTitle — solo catalog */}
                {id === 'catalog' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center">
                      Título de destacados
                      <OverrideDot actual={cfg.featuredTitle} def={def.featuredTitle} />
                    </label>
                    <input
                      type="text"
                      name={`pages.${id}.featuredTitle`}
                      defaultValue={cfg.featuredTitle ?? ''}
                      maxLength={200}
                      placeholder={def.featuredTitle ?? '—'}
                      className={fieldInputCls()}
                    />
                  </div>
                )}

                {/* emptyMessage — catalog, promotions, faq, gallery, blog */}
                {(id === 'catalog' || id === 'promotions' || id === 'faq' || id === 'gallery' || id === 'blog') && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center">
                      Mensaje cuando no hay contenido
                      <OverrideDot actual={cfg.emptyMessage} def={def.emptyMessage} />
                    </label>
                    <input
                      type="text"
                      name={`pages.${id}.emptyMessage`}
                      defaultValue={cfg.emptyMessage ?? ''}
                      maxLength={300}
                      placeholder={def.emptyMessage ?? '—'}
                      className={fieldInputCls()}
                    />
                  </div>
                )}
              </div>
            </details>
          )
        })}
      </section>

      {/* ── Secciones de la home ───────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Secciones de la home
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Orden y contenido de las secciones de la página principal.
          </p>
        </div>

        {sectionItems.map(({ id, order }, idx) => {
          const cfg = resolved.sections[id]
          const def = defaults.sections[id]
          const hasOverride =
            cfg.enabled !== def.enabled ||
            order !== def.order ||
            cfg.title !== def.title ||
            cfg.subtitle !== def.subtitle ||
            cfg.buttonLabel !== def.buttonLabel ||
            cfg.message !== def.message

          return (
            <div
              key={id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            >
              {/* Input oculto para el orden */}
              <input type="hidden" name={`sections.${id}.order`} value={order} />

              {/* Cabecera */}
              <div className="flex items-center gap-2 px-4 py-3">
                {/* Flechas de orden */}
                <div className="flex flex-col shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="px-1 py-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-25 disabled:cursor-not-allowed text-[10px] leading-none"
                    aria-label="Subir"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === sectionItems.length - 1}
                    className="px-1 py-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-25 disabled:cursor-not-allowed text-[10px] leading-none"
                    aria-label="Bajar"
                  >
                    ▼
                  </button>
                </div>

                {/* Toggle */}
                <input
                  type="checkbox"
                  name={`sections.${id}.enabled`}
                  id={`section-${id}`}
                  defaultChecked={cfg.enabled}
                  className="h-4 w-4 shrink-0 rounded border-zinc-300 dark:border-zinc-700 focus:ring-zinc-900 cursor-pointer"
                />

                {/* Etiqueta */}
                <label
                  htmlFor={`section-${id}`}
                  className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex-1 cursor-pointer"
                >
                  {SECTION_LABELS[id]}
                  {hasOverride && <span className="ml-1 text-amber-500 text-xs">●</span>}
                </label>

                {/* dependsOn badge */}
                {def.dependsOn && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    req: {def.dependsOn}
                  </span>
                )}

                <span className="text-xs text-zinc-400 tabular-nums ml-1">#{order}</span>
              </div>

              {/* Campos de contenido */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center">
                      Título
                      <OverrideDot actual={cfg.title} def={def.title} />
                    </label>
                    <input
                      type="text"
                      name={`sections.${id}.title`}
                      defaultValue={cfg.title ?? ''}
                      maxLength={200}
                      placeholder={def.title ?? '—'}
                      className={fieldInputCls()}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center">
                      Subtítulo
                      <OverrideDot actual={cfg.subtitle} def={def.subtitle} />
                    </label>
                    <input
                      type="text"
                      name={`sections.${id}.subtitle`}
                      defaultValue={cfg.subtitle ?? ''}
                      maxLength={300}
                      placeholder={def.subtitle ?? '—'}
                      className={fieldInputCls()}
                    />
                  </div>
                </div>

                {/* Campos exclusivos de whatsapp_cta */}
                {id === 'whatsapp_cta' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center">
                        Texto del botón
                        <OverrideDot actual={cfg.buttonLabel} def={def.buttonLabel} />
                      </label>
                      <input
                        type="text"
                        name={`sections.${id}.buttonLabel`}
                        defaultValue={cfg.buttonLabel ?? ''}
                        maxLength={100}
                        placeholder={def.buttonLabel ?? '—'}
                        className={fieldInputCls()}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center">
                        Mensaje pre-cargado
                        <OverrideDot actual={cfg.message} def={def.message} />
                      </label>
                      <input
                        type="text"
                        name={`sections.${id}.message`}
                        defaultValue={cfg.message ?? ''}
                        maxLength={300}
                        placeholder={def.message ?? '—'}
                        className={fieldInputCls()}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </section>

      {/* ── Funcionalidades ────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Funcionalidades
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Activa o desactiva funcionalidades transversales.
          </p>
        </div>

        <div className="space-y-3">
          {FEATURE_IDS.map((id) => {
            const cfg = resolved.features[id]
            const def = defaults.features[id]
            return (
              <div key={id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name={`features.${id}.enabled`}
                  id={`feature-${id}`}
                  defaultChecked={cfg.enabled}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 focus:ring-zinc-900 cursor-pointer"
                />
                <label
                  htmlFor={`feature-${id}`}
                  className="text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer flex items-center"
                >
                  {FEATURE_LABELS[id]}
                  <OverrideDot actual={cfg.enabled} def={def.enabled} />
                </label>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Leyenda ────────────────────────────────────────────────────────── */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        <span className="text-amber-500">●</span> Indica un valor personalizado distinto al default de plataforma.
        Los campos con placeholder muestran el valor global que se aplicaría si se deja en blanco.
      </p>

      {/* ── Guardar ────────────────────────────────────────────────────────── */}
      <div>
        <SubmitButton label="Guardar módulos" pendingLabel="Guardando..." />
      </div>
    </form>
  )
}
