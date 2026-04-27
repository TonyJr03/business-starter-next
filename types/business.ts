import type { BusinessBranding, BusinessSocial, DayHours } from './business-config';
import type { PageModuleId, PageModuleConfig } from './page-modules';
import type { SectionModuleId } from './section-modules';
import type { FeatureModuleId, FeatureModuleConfig } from './feature-modules';

// ─── Overrides modulares por tenant ──────────────────────────────────────────

/**
 * Override parcial de la configuración modular de un negocio.
 *
 * Cada campo es opcional: un tenant puede sobreescribir solo las partes
 * que necesita; el resto se obtiene de `globalConfig.modules` como fallback.
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
   * Las props visuales (title, bg, size…) permanecen en globalConfig — solo se persiste
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
 *   - Branding: persistido como JSONB, mergeado con globalConfig.branding en el layout.
 *   - Módulos: persistidos como JSONB (BusinessModulesOverride), mergeados con
 *     globalConfig.modules en `resolveModules()`. NULL = usar base global completa.
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
  /** Branding visual del tenant. Si es undefined, el layout usa globalConfig.branding como fallback. */
  branding?: BusinessBranding;
  /**
   * Overrides modulares del tenant. Si es undefined, `resolveModules()` retorna
   * `globalConfig.modules` completo sin modificaciones.
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
