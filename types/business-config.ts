import type { SectionModuleEntry } from './section-modules';
import type { PageModulesConfig } from './page-modules';
import type { FeatureModulesConfig } from './feature-modules';

// ─── Identity ─────────────────────────────────────────────────────────────────

export interface BusinessLogo {
  /** Ruta relativa o URL absoluta de la imagen del logo. */
  url: string;
  /** Texto alternativo accesible. */
  alt: string;
  width?: number;
  height?: number;
}

export interface BusinessIdentity {
  /** Nombre comercial del negocio (requerido). */
  name: string;
  /** Slug seguro para URL del negocio (opcional). */
  slug?: string;
  /** Razón social / nombre legal (opcional). */
  legalName?: string;
  /** Frase corta de marca (requerido). */
  tagline: string;
  /** Descripción completa usada en About y meta tags (requerido). */
  description: string;
  /** Descripción breve de una línea para footer y meta tags cortos (opcional). */
  shortDescription?: string;
  logo?: BusinessLogo;
  /** URL de imagen de portada usada en hero/og:image (opcional). */
  coverImageUrl?: string;
}

// ─── Branding ─────────────────────────────────────────────────────────────────

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

export interface BrandingTypography {
  /** Fuente para títulos y encabezados. */
  heading?: string;
  /** Fuente para cuerpo de texto. */
  body?: string;
}

export interface BusinessBranding {
  /**
   * Clave de tema predefinido. Permite seleccionar un preset visual completo.
   * Si no se especifica, se aplica el tema 'default'.
   */
  themeKey?: string;
  /** Sobreescritura de colores del sistema de diseño (opcional). */
  colors?: BrandingColors;
  /** Fuentes de marca (heading / body). Opcionales. */
  typography?: BrandingTypography;
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export interface BusinessContact {
  /** Número de WhatsApp con código de país en formato E.164 (ej. '+5350000000'). */
  whatsapp: string;
  phone?: string;
  email?: string;
  /** Dirección postal legible (calle, municipio). */
  address?: string;
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface BusinessLocation {
  /** Ciudad donde opera el negocio (requerido). */
  city: string;
  /** País donde opera el negocio (requerido). */
  country: string;
  /** Calle y número / esquina (opcional). */
  street?: string;
  /** Municipio o barrio (opcional). */
  municipality?: string;
  /** URL de embed de Google Maps u otro proveedor (opcional). */
  mapUrl?: string;
  /** Coordenadas geográficas para integraciones de mapa (opcional). */
  coordinates?: GeoCoordinates;
}

// ─── Hours ────────────────────────────────────────────────────────────────────

export interface DayHours {
  /** Nombre del día en el idioma del negocio (ej. 'Lunes'). */
  day: string;
  /** Hora de apertura en formato HH:MM. Se ignora si `isClosed` es true. */
  open: string;
  /** Hora de cierre en formato HH:MM. Se ignora si `isClosed` es true. */
  close: string;
  /** Marca el día como cerrado. */
  isClosed: boolean;
}

// ─── Social ───────────────────────────────────────────────────────────────────

export interface BusinessSocial {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  telegram?: string;
  youtube?: string;
  /** Permite declarar plataformas adicionales sin romper el tipo base. */
  [platform: string]: string | undefined;
}

// ─── Modules ──────────────────────────────────────────────────────────────────

export interface BusinessModulesConfig {
  /** Módulos de página activables — cada uno con su ruta, label y config. */
  pages: PageModulesConfig;
  /**
   * Secciones de la página de inicio:
   * orden, visibilidad y props visuales de cada sección.
   */
  sections: SectionModuleEntry[];
  /** Feature modules funcionales — cada feature tiene su propio `{ enabled }`. */
  features: FeatureModulesConfig;
}

// ─── Page copy ────────────────────────────────────────────────────────────────

/** Bloque de textos para una sección CTA de WhatsApp dentro de una página. */
export interface PageCtaCopy {
  title: string;
  subtitle?: string;
  buttonLabel: string;
  /** Mensaje pre-escrito enviado al abrir WhatsApp. */
  message: string;
}

// ─── SEO Defaults ─────────────────────────────────────────────────────────────

export interface BusinessSeoDefaults {
  /**
   * Plantilla para el `<title>` de cada página.
   * Usa `%s` como marcador del título específico.
   * Ej: `'%s | Café La Esquina'`
   */
  titleTemplate: string;
  /** Descripción meta usada cuando la página no define la propia. */
  defaultDescription: string;
  /** URL de la imagen Open Graph por defecto (relativa o absoluta). */
  ogImage?: string;
}

// ─── Root Contract ─────────────────────────────────────────────────────────────

/**
 * Configuración global del sistema — define los defaults de plataforma
 * que aplican a todos los tenants como base.
 *
 * Solo contiene lo que el sistema necesita en código:
 *
 * | bloque    | responsabilidad                                               |
 * |-----------|---------------------------------------------------------------|
 * | `branding`| colores y tipografías por defecto (fallback si el tenant      |
 * |           | no tiene branding propio en DB)                               |
 * | `modules` | módulos de página + secciones home + feature modules.         |
 * |           | El tenant puede sobreescribir partes vía `BusinessModulesOverride` |
 *
 * Los datos operativos de cada negocio (identity, contact, location,
 * hours, social) viven en la tabla `businesses` de Supabase, no aquí.
 */
export interface BusinessGlobalConfig {
  branding: BusinessBranding;
  modules: BusinessModulesConfig;
}

// ─── Validación en tiempo de ejecución ────────────────────────────────────────

/** Mensaje de error de validación estructural. */
export type ConfigValidationError = string;

/**
 * Valida la estructura básica de `BusinessGlobalConfig`.
 * Comprueba que los módulos requeridos estén presentes.
 *
 * @returns Array de mensajes de error. Array vacío indica config válida.
 */
export function validateBusinessConfig(
  config: BusinessGlobalConfig,
): ConfigValidationError[] {
  const errors: ConfigValidationError[] = [];

  if (!config.modules?.pages) {
    errors.push('modules.pages es obligatorio.');
  }
  if (!Array.isArray(config.modules?.sections)) {
    errors.push('modules.sections debe ser un array.');
  }

  return errors;
}

/**
 * Lanza un error descriptivo si `BusinessGlobalConfig` contiene problemas estructurales.
 *
 * @throws {Error} Con el listado completo de errores encontrados.
 */
export function assertValidBusinessConfig(config: BusinessGlobalConfig): void {
  const errors = validateBusinessConfig(config);
  if (errors.length > 0) {
    throw new Error(
      `BusinessGlobalConfig inválida:\n${errors.map((e) => `  • ${e}`).join('\n')}`,
    );
  }
}
