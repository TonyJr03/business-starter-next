import type { PageModuleId } from './page-modules';
import type { FeatureModuleId } from './feature-modules';

// ─── Dependencia ──────────────────────────────────────────────────────────────

/**
 * Condición que debe estar satisfecha para que un section-module derivado
 * pueda renderizarse. Los section-modules independientes no tienen este campo.
 *
 * - PageModuleId      → el page-module homólogo debe estar enabled
 * - FeatureModuleId   → el feature-module debe estar enabled
 * - 'business.hours'     → business.hours debe tener al menos un día
 * - 'business.location'  → business.location debe existir
 * - 'business.whatsapp'  → business.contact.whatsapp debe existir
 */
export type SectionDependency =
  | PageModuleId
  | FeatureModuleId
  | 'business.hours'
  | 'business.location'
  | 'business.whatsapp';

// ─── IDs de section-modules ───────────────────────────────────────────────────

/**
 * Unión de todos los identificadores de section-modules activables.
 * - hero: queda fuera — es UI de layout fijo, no un módulo configurable.
 * - testimonials: queda fuera — no planificado en este ciclo.
 */
export type SectionModuleId =
  | 'highlights'
  | 'promotions'
  | 'hours'
  | 'location'
  | 'whatsapp_cta';

// ─── Props de layout visual ───────────────────────────────────────────────────

/**
 * Props de renderizado visual de una sección: fondo, espaciado y columnas.
 * Agrupadas en un tipo compuesto para separarlas de los campos de contenido.
 * Análogo a BrandingColors / BrandingTypography dentro de BrandingConfig.
 */
export interface SectionLayout {
  /** Fondo visual de la sección. */
  bg?: 'default' | 'surface' | 'secondary' | 'primary';
  /** Tamaño/espaciado de la sección. */
  size?: 'sm' | 'md' | 'lg';
  /** Número de columnas de la grilla (usado por highlights). */
  columns?: 2 | 3 | 4;
}

// ─── Configuración por section-module ─────────────────────────────────────────

/**
 * Campos overrideables por tenant en un section-module.
 * Paralelo directo a PageModuleConfig y FeatureModuleConfig.
 *
 * `dependsOn` queda excluido: es una restricción estructural de plataforma
 * que el tenant no puede modificar. Vive en SectionModuleEntry.
 */
export interface SectionModuleConfig {
  /** Si este section-module está activo. */
  enabled: boolean;
  /** Orden de renderizado ascendente (1 = primero). */
  order: number;
  /** Props de layout visual (fondo, espaciado, columnas). */
  layout?: SectionLayout;
  /** Título de la sección (opcional). */
  title?: string;
  /** Texto descriptivo bajo el título (opcional). */
  subtitle?: string;
  /** Texto del botón CTA (usado por whatsapp_cta). */
  buttonLabel?: string;
  /** Mensaje pre-cargado (usado por whatsapp_cta). */
  message?: string;
}

// ─── Entrada de plataforma ────────────────────────────────────────────────────

/**
 * Entrada completa de un section-module tal como la almacena la plataforma.
 * Extiende SectionModuleConfig con `dependsOn`, que el tenant no puede sobreescribir.
 */
export interface SectionModuleEntry extends SectionModuleConfig {
  /**
   * Dependencia que debe satisfacerse para renderizar este módulo.
   * Ausente en section-modules independientes (highlights).
   * Presente en derivados — el resolver lo verifica antes de activarlos.
   */
  dependsOn?: SectionDependency;
}

// ─── Mapa completo ────────────────────────────────────────────────────────────

/**
 * Registro de cada section-module, indexado por SectionModuleId.
 * Type-safe: añadir un ID a la unión fuerza una entrada correspondiente aquí.
 */
export type SectionModulesConfig = Record<SectionModuleId, SectionModuleEntry>;

// ─── Tipo de sección resuelta ─────────────────────────────────────────────────

/**
 * Entrada de sección con el id reinyectado — resultado de resolveActiveSections.
 * Permite al SectionRenderer discriminar por `id` sin necesidad de un discriminated union.
 * El id se reinyecta porque SectionModulesConfig es un Record: al iterar se pierde la key.
 */
export type ResolvedSectionEntry = { id: SectionModuleId } & SectionModuleEntry;
