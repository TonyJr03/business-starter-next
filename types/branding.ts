// ─── Colors ───────────────────────────────────────────────────────────────────

export interface BrandingColors {
  /** Color principal de marca: botones, headings, íconos activos. */
  primary?: string;
  /** Color de fondo de secciones destacadas (hero, encabezados). */
  secondary?: string;
  /** Color de acento: badges, CTAs secundarios, highlights. */
  accent?: string;
  /** Fondo del footer. */
  footerBg?: string;
  /** Texto en negrita del footer. */
  footerText?: string;
  /** Texto secundario e iconos del footer. */
  footerTextMuted?: string;
  /** Línea separadora inferior del footer. */
  footerBorder?: string;
}

// ─── Typography ───────────────────────────────────────────────────────────────

export interface BrandingTypography {
  /** Fuente para títulos y encabezados. */
  heading?: string;
  /** Fuente para cuerpo de texto. */
  body?: string;
}

// ─── Branding ─────────────────────────────────────────────────────────────────

export interface BusinessBranding {
  /**
   * Clave de tema predefinido. Permite seleccionar un preset visual completo.
   * Si no se especifica, se aplica el tema 'default'.
   */
  themeKey?: string;
  colors?: BrandingColors;
  typography?: BrandingTypography;
}
