/**
 * Branding utilities — Business Starter Next
 *
 * Convierte la configuración de marca del negocio en CSS custom properties
 * inyectables como `style` en el layout público (Server Component).
 *
 * Estrategia de fallback (por orden de prioridad):
 *   1. Branding por tenant desde DB        → pendiente (M6+)
 *   2. Branding estático desde businessGlobalConfig → activo en M5
 *   3. Defaults hardcoded                   → coinciden con tokens.css
 *
 * El punto de extensión para (1) está documentado en `buildBrandVars`:
 * cuando el DB tenga columnas de branding, se pasan como `tenantOverride`.
 */

import type { BusinessBranding } from '@/types'

// ─── Defaults ────────────────────────────────────────────────────────────────
// Coinciden con los valores de tokens.css. Si ambos `tenantOverride` y
// `configBranding` son undefined, la UI mantiene la estética base del starter.

const BRAND_DEFAULTS = {
  colorPrimary:     '#6F4E37',
  colorSecondary:   '#F5E6D3',
  colorAccent:      '#D4A574',
  colorFooterBg:    '#111827',
  colorFooterText:  '#FFFFFF',
  colorFooterMuted: '#9CA3AF',
  colorFooterBorder:'#1F2937',
  fontHeading:      "'Inter', system-ui, sans-serif",
  fontBody:         "'Inter', system-ui, sans-serif",
} as const

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Construye el objeto de CSS custom properties de marca para inyectar
 * como `style` en el wrapper del layout público.
 *
 * @param configBranding  Branding estático de businessGlobalConfig (fuente actual).
 * @param tenantOverride  Branding por tenant desde DB (pendiente M6+).
 *                        Cuando esté disponible, sus valores tienen prioridad.
 */
export function buildBrandVars(
  configBranding: BusinessBranding,
  tenantOverride?: Partial<BusinessBranding>,
): React.CSSProperties {
  // Fusiona: tenantOverride > configBranding > BRAND_DEFAULTS
  const colors = {
    ...configBranding.colors,
    ...tenantOverride?.colors,
  }
  const typography = {
    ...configBranding.typography,
    ...tenantOverride?.typography,
  }

  return {
    '--color-primary':           colors.primary         ?? BRAND_DEFAULTS.colorPrimary,
    '--color-secondary':         colors.secondary       ?? BRAND_DEFAULTS.colorSecondary,
    '--color-accent':            colors.accent          ?? BRAND_DEFAULTS.colorAccent,
    '--color-footer-bg':         colors.footerBg        ?? BRAND_DEFAULTS.colorFooterBg,
    '--color-footer-text':       colors.footerText      ?? BRAND_DEFAULTS.colorFooterText,
    '--color-footer-text-muted': colors.footerTextMuted ?? BRAND_DEFAULTS.colorFooterMuted,
    '--color-footer-border':     colors.footerBorder    ?? BRAND_DEFAULTS.colorFooterBorder,
    '--font-heading':            typography.heading     ?? BRAND_DEFAULTS.fontHeading,
    '--font-body':               typography.body        ?? BRAND_DEFAULTS.fontBody,
  } as React.CSSProperties
}

/**
 * Devuelve el valor para el atributo `data-theme` del layout.
 * Permite activar skins visuales completas en el futuro mediante
 * selectores CSS `[data-theme="xxx"]`.
 */
export function getThemeKey(
  configBranding: BusinessBranding,
  tenantOverride?: Partial<BusinessBranding>,
): string {
  return tenantOverride?.themeKey ?? configBranding.themeKey ?? 'default'
}
