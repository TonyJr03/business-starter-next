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

// ─── Configuración por section-module ─────────────────────────────────────────

/**
 * Configuración compartida por cada section-module.
 * Paralelo directo a PageModuleConfig: un solo tipo para todos los módulos.
 *
 * Las props visuales específicas de cada sección (columns en highlights, etc.)
 * están incluidas aquí como opcionales — el mismo tradeoff pragmático que
 * featuredTitle/emptyMessage en PageModuleConfig.
 */
export interface SectionModuleConfig {
  /** Si este section-module está activo. */
  enabled: boolean;
  /** Orden de renderizado ascendente (1 = primero). */
  order: number;
  /**
   * Dependencia que debe satisfacerse para renderizar este módulo.
   * Ausente en section-modules independientes (highlights).
   * Presente en derivados — el resolver lo verifica antes de activarlos.
   */
  dependsOn?: SectionDependency;
  /** Título de la sección (opcional). */
  title?: string;
  /** Texto descriptivo bajo el título (opcional). */
  subtitle?: string;
  /** Fondo visual de la sección. */
  bg?: 'default' | 'surface' | 'secondary' | 'primary';
  /** Tamaño/espaciado de la sección. */
  size?: 'sm' | 'md' | 'lg';
  /** Número de columnas de la grilla (usado por highlights). */
  columns?: 2 | 3 | 4;
  /** Texto del botón CTA (usado por whatsapp_cta). */
  buttonLabel?: string;
  /** Mensaje pre-cargado (usado por whatsapp_cta). */
  message?: string;
}

// ─── Mapa completo ────────────────────────────────────────────────────────────

/**
 * Registro de cada section-module, indexado por SectionModuleId.
 * Type-safe: añadir un ID a la unión fuerza una entrada correspondiente aquí.
 */
export type SectionModulesConfig = Record<SectionModuleId, SectionModuleConfig>;

// ─── Tipo de sección resuelta ─────────────────────────────────────────────────

/**
 * Entrada de sección con el id reinyectado — resultado de resolveActiveSections.
 * Permite al SectionRenderer discriminar por `id` sin necesidad de un discriminated union.
 * El id se reinyecta porque SectionModulesConfig es un Record: al iterar se pierde la key.
 */
export type ResolvedSectionEntry = { id: SectionModuleId } & SectionModuleConfig;
