'use client'

import { useState, useCallback } from 'react'
import { platformDefaults } from '@/config/platform-defaults'
import { AdminAlert } from '@/components/admin/AdminAlert'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { fieldInputCls } from '@/components/admin/formUtils'
import { useAdminForm } from '@/components/admin/useAdminForm'
import { updateBrandingAction } from './actions'
import type { BrandingColors, BrandingTypography, BrandingOverride } from '@/types'

// ─── Temas disponibles ────────────────────────────────────────────────────────

const AVAILABLE_THEMES = ['default'] as const

// ─── Config de colores para el UI ─────────────────────────────────────────────

const COLOR_FIELDS: { key: keyof BrandingColors; label: string; hint?: string }[] = [
  { key: 'primary',         label: 'Principal',           hint: 'Botones, headings, íconos activos' },
  { key: 'secondary',       label: 'Secundario',          hint: 'Fondo de hero y secciones destacadas' },
  { key: 'accent',          label: 'Acento',              hint: 'Badges, CTAs secundarios' },
  { key: 'footerBg',        label: 'Fondo del footer',    hint: 'Color de fondo del pie de página' },
  { key: 'footerText',      label: 'Texto del footer',    hint: 'Texto principal del footer' },
  { key: 'footerTextMuted', label: 'Texto muted (footer)', hint: 'Texto secundario e iconos' },
  { key: 'footerBorder',    label: 'Borde del footer',    hint: 'Línea separadora inferior' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function OverrideDot({ isOverride }: { isOverride: boolean }) {
  if (!isOverride) return null
  return <span className="ml-1.5 text-amber-500 text-xs" title="Valor personalizado">●</span>
}

// ─── Preview ──────────────────────────────────────────────────────────────────

interface PreviewState {
  colors: BrandingColors
  typography: BrandingTypography
}

function BrandingPreview({ state }: { state: PreviewState }) {
  const { colors, typography } = state

  const vars = {
    '--preview-primary':         colors.primary,
    '--preview-secondary':       colors.secondary,
    '--preview-accent':          colors.accent,
    '--preview-footer-bg':       colors.footerBg,
    '--preview-footer-text':     colors.footerText,
    '--preview-footer-muted':    colors.footerTextMuted,
    '--preview-footer-border':   colors.footerBorder,
    '--preview-font-heading':    typography.heading,
    '--preview-font-body':       typography.body,
  } as React.CSSProperties

  return (
    <div
      style={vars}
      className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 text-sm"
    >
      {/* Nav bar */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: 'var(--preview-primary)' }}
      >
        <span
          className="font-semibold text-white text-base"
          style={{ fontFamily: 'var(--preview-font-heading)' }}
        >
          Mi Negocio
        </span>
        <div className="flex gap-3 text-white/80 text-xs" style={{ fontFamily: 'var(--preview-font-body)' }}>
          <span>Catálogo</span>
          <span>Nosotros</span>
          <span>Contacto</span>
        </div>
      </div>

      {/* Hero / secondary section */}
      <div
        className="px-5 py-6"
        style={{ backgroundColor: 'var(--preview-secondary)' }}
      >
        <h2
          className="text-xl font-bold mb-1"
          style={{ color: 'var(--preview-primary)', fontFamily: 'var(--preview-font-heading)' }}
        >
          Bienvenidos a nuestro local
        </h2>
        <p
          className="text-sm mb-4 text-zinc-700"
          style={{ fontFamily: 'var(--preview-font-body)' }}
        >
          Los mejores productos de la ciudad, con atención personalizada.
        </p>
        <button
          className="px-4 py-1.5 rounded text-white text-xs font-medium"
          style={{ backgroundColor: 'var(--preview-primary)', fontFamily: 'var(--preview-font-body)' }}
        >
          Ver catálogo
        </button>
      </div>

      {/* Accent strip */}
      <div
        className="px-5 py-2.5 flex items-center gap-2"
        style={{ backgroundColor: 'var(--preview-accent)' }}
      >
        <span
          className="text-xs font-semibold text-white"
          style={{ fontFamily: 'var(--preview-font-body)' }}
        >
          ¡Oferta especial disponible hoy!
        </span>
      </div>

      {/* Footer */}
      <div
        className="px-5 py-4"
        style={{
          backgroundColor: 'var(--preview-footer-bg)',
          borderTop: `1px solid var(--preview-footer-border)`,
        }}
      >
        <p
          className="text-xs font-semibold"
          style={{ color: 'var(--preview-footer-text)', fontFamily: 'var(--preview-font-heading)' }}
        >
          Mi Negocio
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: 'var(--preview-footer-muted)', fontFamily: 'var(--preview-font-body)' }}
        >
          © 2026 · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}

// ─── Tipos y props ────────────────────────────────────────────────────────────

interface Props {
  businessId: string
  /** Valores efectivos: platformDefaults.branding + override del tenant aplicado. */
  resolved: { colors: BrandingColors; typography: BrandingTypography; themeKey: string }
  /** Override crudo almacenado en DB (puede ser undefined si no hay override). */
  override: BrandingOverride | undefined
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function BrandingEditor({ businessId, resolved, override }: Props) {
  const { state, formAction } = useAdminForm(updateBrandingAction.bind(null, businessId))

  const base = platformDefaults.branding

  // Estado local para preview en tiempo real
  const [colors, setColors] = useState<BrandingColors>({ ...resolved.colors })
  const [typography, setTypography] = useState<BrandingTypography>({ ...resolved.typography })
  const [themeKey, setThemeKey] = useState(resolved.themeKey)

  const setColor = useCallback((key: keyof BrandingColors, val: string) => {
    setColors((prev) => ({ ...prev, [key]: val }))
  }, [])

  const isColorOverride = (key: keyof BrandingColors) =>
    (override?.colors?.[key] ?? base.colors[key]) !== base.colors[key]

  const isTypoOverride = (key: keyof BrandingTypography) =>
    (override?.typography?.[key] ?? base.typography[key]) !== base.typography[key]

  const isThemeOverride = (override?.themeKey ?? base.themeKey) !== base.themeKey

  return (
    <div className="space-y-8">
      {state && !state.ok && (
        <AdminAlert type="error" message={state.error ?? 'Error desconocido'} />
      )}

      <form action={formAction} className="space-y-8" noValidate>

        {/* ── Tema ──────────────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Tema
          </h2>

          <div className="space-y-1.5">
            <label htmlFor="themeKey" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center">
              Clave de tema
              <OverrideDot isOverride={isThemeOverride} />
            </label>
            <select
              id="themeKey"
              name="themeKey"
              value={themeKey}
              onChange={(e) => setThemeKey(e.target.value)}
              className={fieldInputCls()}
            >
              {AVAILABLE_THEMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Activa skins completas mediante selectores CSS <code>[data-theme=&quot;…&quot;]</code> en tokens.css.
            </p>
          </div>
        </section>

        {/* ── Colores ───────────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Colores
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COLOR_FIELDS.map(({ key, label, hint }) => (
              <div key={key} className="space-y-1.5">
                <label
                  htmlFor={`color-${key}`}
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center"
                >
                  {label}
                  <OverrideDot isOverride={isColorOverride(key)} />
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id={`color-${key}`}
                    name={`colors.${key}`}
                    value={colors[key]}
                    onChange={(e) => setColor(key, e.target.value)}
                    className="h-9 w-12 shrink-0 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    aria-label={`Hex de ${label}`}
                    value={colors[key]}
                    onChange={(e) => {
                      const v = e.target.value
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setColor(key, v)
                    }}
                    maxLength={7}
                    className={fieldInputCls()}
                    // Sincroniza con el hidden real al cambiar texto
                    onBlur={(e) => {
                      const v = e.target.value
                      const el = document.getElementById(`color-${key}`) as HTMLInputElement | null
                      if (el && /^#[0-9A-Fa-f]{6}$/.test(v)) el.value = v
                    }}
                  />
                  {/* El input[type=color] ya tiene name, el texto es solo visual */}
                </div>
                {hint && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
                )}
                <p className="text-xs text-zinc-300 dark:text-zinc-600 font-mono">
                  default: {base.colors[key]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tipografía ────────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Tipografía
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="typo-heading" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center">
                Fuente de encabezados
                <OverrideDot isOverride={isTypoOverride('heading')} />
              </label>
              <input
                type="text"
                id="typo-heading"
                name="typography.heading"
                value={typography.heading}
                onChange={(e) => setTypography((p) => ({ ...p, heading: e.target.value }))}
                placeholder={base.typography.heading}
                maxLength={200}
                className={fieldInputCls()}
              />
              <p className="text-xs text-zinc-300 dark:text-zinc-600 font-mono truncate">
                default: {base.typography.heading}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="typo-body" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center">
                Fuente de cuerpo
                <OverrideDot isOverride={isTypoOverride('body')} />
              </label>
              <input
                type="text"
                id="typo-body"
                name="typography.body"
                value={typography.body}
                onChange={(e) => setTypography((p) => ({ ...p, body: e.target.value }))}
                placeholder={base.typography.body}
                maxLength={200}
                className={fieldInputCls()}
              />
              <p className="text-xs text-zinc-300 dark:text-zinc-600 font-mono truncate">
                default: {base.typography.body}
              </p>
            </div>
          </div>
        </section>

        {/* ── Preview ───────────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Preview en tiempo real
          </h2>
          <BrandingPreview state={{ colors, typography }} />
        </section>

        {/* ── Leyenda + guardar ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            <span className="text-amber-500">●</span> Indica un valor personalizado distinto al default de plataforma.
            Solo los campos que difieran del default se guardarán en la base de datos.
          </p>
          <SubmitButton label="Guardar branding" pendingLabel="Guardando..." />
        </div>

      </form>
    </div>
  )
}
