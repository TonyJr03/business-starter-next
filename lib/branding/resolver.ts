/**
 * Branding resolver — Business Starter Next
 *
 * Convierte la configuración de marca del tenant en CSS custom properties
 * inyectables como `style` en el layout público (Server Component).
 *
 * Merge: business.branding (DB) > businessGlobalConfig.branding (base)
 *
 * Si el tenant no tiene branding en DB, se aplica el branding de la plataforma
 * definido en `config/business-config.ts`. No hay una tercera capa de defaults
 * hardcoded: businessGlobalConfig.branding siempre está presente.
 */

import { platformDefaults } from '@/config/platform-defaults'
import type { BrandingConfig, BrandingOverride, BrandingColors, BrandingTypography, BusinessSettings } from '@/types'

// ─── Merge interno ────────────────────────────────────────────────────────────

function mergeBranding(
  base: BrandingConfig,
  override?: BrandingOverride,
): { colors: BrandingColors; typography: BrandingTypography } {
  return {
    colors:     { ...base.colors,     ...override?.colors     },
    typography: { ...base.typography, ...override?.typography },
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Devuelve las CSS custom properties de branding para inyectar como `style`
 * en el layout del tenant.
 *
 * Merge: business.branding (DB) > businessGlobalConfig.branding (base)
 *
 * @param business - Settings del tenant. null → solo base de plataforma.
 */
export function resolveBrandVars(
  business: BusinessSettings | null,
): React.CSSProperties {
  const { colors, typography } = mergeBranding(
    platformDefaults.branding,
    business?.branding,
  )

  return {
    '--color-primary':           colors.primary,
    '--color-secondary':         colors.secondary,
    '--color-accent':            colors.accent,
    '--color-footer-bg':         colors.footerBg,
    '--color-footer-text':       colors.footerText,
    '--color-footer-text-muted': colors.footerTextMuted,
    '--color-footer-border':     colors.footerBorder,
    '--font-heading':            typography.heading,
    '--font-body':               typography.body,
  } as React.CSSProperties
}

/**
 * Devuelve el valor para el atributo `data-theme` del layout.
 * Permite activar skins visuales completas mediante selectores CSS `[data-theme="xxx"]`.
 *
 * Merge: business.branding.themeKey (DB) > businessGlobalConfig.branding.themeKey > 'default'
 *
 * @param business - Settings del tenant. null → tema por defecto.
 */
export function resolveThemeKey(
  business: BusinessSettings | null,
): string {
  return (
    business?.branding?.themeKey ??
    platformDefaults.branding.themeKey
  )
}
