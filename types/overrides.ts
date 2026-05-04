import type { PageModuleId, PageModuleConfig } from './page-modules';
import type { SectionModuleId } from './section-modules';
import type { FeatureModuleId, FeatureModuleConfig } from './feature-modules';

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
