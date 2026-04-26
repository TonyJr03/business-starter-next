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

export interface CatalogPageCopy {
  /** H1 visible de la página de catálogo. */
  heading: string;
  /** Subtítulo bajo el H1. */
  subheading?: string;
  /** Título de la sección de productos destacados. */
  featuredTitle: string;
}

export interface PromotionsPageCopy {
  /** H1 visible de la página de promociones. */
  heading: string;
  /** Mensaje mostrado cuando no hay promociones activas. */
  emptyMessage: string;
}

/**
 * Textos visibles al cliente final para páginas con copy específica.
 * Los campos genéricos (title, subtitle, cta) están en PageModuleConfig.
 */
export interface BusinessPagesCopy {
  catalog: CatalogPageCopy;
  promotions: PromotionsPageCopy;
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
 * Contrato unificado de configuración global del negocio.
 *
 * Estructura en bloques — cada campo agrupa una responsabilidad:
 *
 * | bloque       | responsabilidad                                           |
 * |--------------|-----------------------------------------------------------|
 * | `identity`   | nombre, razón social, tagline, descripción, logo          |
 * | `branding`   | tema visual, colores sobreescritos, tipografías           |
 * | `contact`    | WhatsApp, teléfono, email, dirección postal               |
 * | `location`   | ciudad, país, URL de mapa, coordenadas                    |
 * | `hours`      | horarios por día de la semana                             |
 * | `social`     | URLs de redes sociales                                    |
 * | `modules`    | módulos de página + secciones home + feature modules      |
 * | `seoDefaults`| plantilla de título, descripción y og:image por defecto   |
 *
 * @example
 * import type { BusinessGlobalConfig } from '@/types';
 * const config: BusinessGlobalConfig = { ... };
 */
export interface BusinessGlobalConfig {
  identity: BusinessIdentity;
  branding: BusinessBranding;
  contact: BusinessContact;
  location: BusinessLocation;
  hours: DayHours[];
  social: BusinessSocial;
  modules: BusinessModulesConfig;
  seoDefaults: BusinessSeoDefaults;
}

// ─── Validación en tiempo de ejecución ────────────────────────────────────────

/** Mensaje de error de validación estructural. */
export type ConfigValidationError = string;

/**
 * Valida la estructura básica de `BusinessGlobalConfig`.
 * Comprueba presencia y formato de los campos obligatorios.
 *
 * La validación de tipos en tiempo de compilación (TypeScript) cubre la
 * estructura general; esta función detecta problemas de valor en tiempo
 * de ejecución (campos vacíos, formatos incorrectos).
 *
 * @returns Array de mensajes de error. Array vacío indica config válida.
 */
export function validateBusinessConfig(
  config: BusinessGlobalConfig,
): ConfigValidationError[] {
  const errors: ConfigValidationError[] = [];

  // ── identity ──────────────────────────────────────────────────────────────
  if (!config.identity.name?.trim()) {
    errors.push('identity.name es obligatorio.');
  }
  if (!config.identity.tagline?.trim()) {
    errors.push('identity.tagline es obligatorio.');
  }
  if (!config.identity.description?.trim()) {
    errors.push('identity.description es obligatorio.');
  }

  // ── contact ───────────────────────────────────────────────────────────────
  if (!config.contact.whatsapp?.trim()) {
    errors.push('contact.whatsapp es obligatorio.');
  } else if (!/^\+\d{7,15}$/.test(config.contact.whatsapp)) {
    errors.push(
      'contact.whatsapp debe tener formato E.164 (ej. "+5350000000").',
    );
  }
  if (
    config.contact.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contact.email)
  ) {
    errors.push(
      'contact.email no tiene un formato de correo electrónico válido.',
    );
  }

  // ── location ──────────────────────────────────────────────────────────────
  if (!config.location.city?.trim()) {
    errors.push('location.city es obligatorio.');
  }
  if (!config.location.country?.trim()) {
    errors.push('location.country es obligatorio.');
  }

  // ── hours ─────────────────────────────────────────────────────────────────
  if (!Array.isArray(config.hours) || config.hours.length === 0) {
    errors.push('hours debe ser un array con al menos una entrada.');
  } else {
    const timeRe = /^\d{2}:\d{2}$/;
    config.hours.forEach((h, i) => {
      if (!h.day?.trim()) {
        errors.push(`hours[${i}].day es obligatorio.`);
      }
      if (!h.isClosed) {
        if (!timeRe.test(h.open)) {
          errors.push(`hours[${i}].open debe tener formato HH:MM.`);
        }
        if (!timeRe.test(h.close)) {
          errors.push(`hours[${i}].close debe tener formato HH:MM.`);
        }
      }
    });
  }

  // ── seoDefaults ───────────────────────────────────────────────────────────
  if (!config.seoDefaults.titleTemplate?.trim()) {
    errors.push('seoDefaults.titleTemplate es obligatorio.');
  } else if (!config.seoDefaults.titleTemplate.includes('%s')) {
    errors.push(
      'seoDefaults.titleTemplate debe incluir "%s" como marcador del título de página.',
    );
  }
  if (!config.seoDefaults.defaultDescription?.trim()) {
    errors.push('seoDefaults.defaultDescription es obligatorio.');
  }

  return errors;
}

/**
 * Lanza un error descriptivo si `BusinessGlobalConfig` contiene problemas estructurales.
 *
 * Úsalo en el arranque de la aplicación para detectar configuraciones incorrectas temprano.
 *
 * @throws {Error} Con el listado completo de errores encontrados.
 *
 * @example
 * import { assertValidBusinessConfig } from '@/types';
 * assertValidBusinessConfig(myConfig); // lanza si hay errores
 */
export function assertValidBusinessConfig(config: BusinessGlobalConfig): void {
  const errors = validateBusinessConfig(config);
  if (errors.length > 0) {
    throw new Error(
      `BusinessGlobalConfig inválida:\n${errors.map((e) => `  • ${e}`).join('\n')}`,
    );
  }
}
