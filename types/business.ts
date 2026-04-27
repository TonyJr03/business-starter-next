import type { PageModuleId, PageModuleConfig } from './page-modules';
import type { SectionModuleId } from './section-modules';
import type { FeatureModuleId, FeatureModuleConfig } from './feature-modules';

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

// ─── Overrides modulares por tenant ──────────────────────────────────────────

/**
 * Override parcial de la configuración modular de un negocio.
 *
 * Cada campo es opcional: un tenant puede sobreescribir solo las partes
 * que necesita; el resto se obtiene de `businessGlobalConfig.modules` como fallback.
 *
 * Estrategia de merge en `resolveModules()`:
 *   - pages:    por clave — se mergean solo los módulos presentes en el override
 *   - sections: por id  — solo se sobreescriben `enabled` y `order`; las props
 *               visuales son configuración global, no datos de tenant
 *   - features: por clave — se mergean solo los features presentes en el override
 */
export interface BusinessModulesOverride {
  /** Overrides parciales de page modules. Solo las claves presentes sobreescriben la base. */
  pages?: Partial<Record<PageModuleId, Partial<PageModuleConfig>>>;
  /**
   * Overrides de visibilidad y orden de secciones de la home, indexados por SectionModuleId.
   * Las props visuales (title, bg, size…) permanecen en businessGlobalConfig — solo se persiste
   * el control de activación y posición por tenant.
   */
  sections?: Partial<Record<SectionModuleId, { enabled?: boolean; order?: number }>>;
  /** Overrides parciales de feature modules. Solo las claves presentes sobreescriben la base. */
  features?: Partial<Record<FeatureModuleId, Partial<FeatureModuleConfig>>>;
}

// ─── Settings del negocio (desde DB) ─────────────────────────────────────────

/**
 * Datos operativos del negocio leídos desde la tabla `businesses`.
 * Refleja los campos editables desde el panel admin.
 *
 * Política de persistencia:
 *   - Campos operativos (name, whatsapp, hours…): persistidos directamente.
 *   - Branding: persistido como JSONB, mergeado con businessGlobalConfig.branding en el layout.
 *   - Módulos: persistidos como JSONB (BusinessModulesOverride), mergeados con
 *     businessGlobalConfig.modules en `resolveModules()`. NULL = usar base global completa.
 */
export interface BusinessSettings {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  social?: BusinessSocial;
  hours?: DayHours[];
  /** Branding visual del tenant. Si es undefined, el layout usa businessGlobalConfig.branding como fallback. */
  branding?: BusinessBranding;
  /**
   * Overrides modulares del tenant. Si es undefined, `resolveModules()` retorna
   * `businessGlobalConfig.modules` completo sin modificaciones.
   */
  modules?: BusinessModulesOverride;
}

// ─── Directorio público de negocios ──────────────────────────────────────────

/**
 * Subconjunto ligero de BusinessSettings para el listado en la plataforma.
 * Solo los campos necesarios para renderizar una BusinessCard.
 */
export interface BusinessDirectoryItem {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  city?: string;
}
