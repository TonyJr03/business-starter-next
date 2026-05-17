// ─── Colors ───────────────────────────────────────────────────────────────────

/**
 * Paleta completa de colores de marca.
 * Todos los campos requeridos — forman la base de `PlatformBranding`.
 * El tenant sobreescribe solo los campos que necesita vía `BrandingOverride`.
 */
export interface BrandingColors {
  /** Color principal de marca: botones, headings, íconos activos. */
  primary: string;
  /** Color de fondo de secciones destacadas (hero, encabezados). */
  secondary: string;
  /** Color de acento: badges, CTAs secundarios, highlights. */
  accent: string;
  /** Fondo del footer. */
  footerBg: string;
  /** Texto en negrita del footer. */
  footerText: string;
  /** Texto secundario e iconos del footer. */
  footerTextMuted: string;
  /** Línea separadora inferior del footer. */
  footerBorder: string;
}

// ─── Typography ───────────────────────────────────────────────────────────────

/**
 * Tipografías del sistema.
 * Todos los campos requeridos — forman la base de `PlatformBranding`.
 */
export interface BrandingTypography {
  /** Fuente para títulos y encabezados. */
  heading: string;
  /** Fuente para cuerpo de texto. */
  body: string;
}

// ─── BrandingConfig ──────────────────────────────────────────────────────────

/**
 * Branding completo de la plataforma — todos los campos requeridos.
 * Definido en `config/platform-defaults.ts`. Sirve como base para el merge
 * con el override parcial del tenant (`BrandingOverride` en `types/overrides.ts`).
 */
export interface BrandingConfig {
  /**
   * Clave de tema predefinido. Permite seleccionar un preset visual completo.
   * Valor de plataforma por defecto: 'default'.
   */
  themeKey: string;
  colors: BrandingColors;
  typography: BrandingTypography;
}
