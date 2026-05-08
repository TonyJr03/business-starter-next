/**
 * Module resolver — resolución base + override por tenant
 *
 * Punto de entrada único para obtener la configuración modular efectiva
 * de un tenant. Implementa el merge entre:
 *   - `businessGlobalConfig.modules` (base: definido en código, aplica a todos los tenants)
 *   - `business.modules`              (overrides: leídos desde la tabla `businesses` en Supabase)
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Reglas de merge (simples y previsibles):
 *
 *   pages:    por clave — `{ ...base[id], ...override[id] }`
 *             Solo las claves presentes en el override modifican su módulo.
 *
 *   sections: por id — solo `enabled` y `order` se sobreescriben.
 *             Las props visuales (title, bg, size…) son config global, no datos.
 *
 *   features: por clave — `{ ...base[id], ...override[id] }`
 *             Solo las claves presentes en el override modifican su feature.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Fallback:
 *   Si `business` es null o `business.modules` es undefined, se retorna
 *   `businessGlobalConfig.modules` sin ninguna modificación.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Uso:
 *
 *   import { resolveModules, resolveActiveSections, resolvePageModule } from '@/lib/modules/resolver'
 *
 *   const modules  = resolveModules(business)
 *   const sections = resolveActiveSections(business)
 *   const catalog  = resolvePageModule(business, 'catalog')
 */

import { businessGlobalConfig } from '@/config/business-config';
import type { BusinessModulesConfig } from '@/types';
import type { PageModuleId, PageModuleConfig } from '@/types';
import type { SectionModuleId, SectionModuleConfig, ResolvedSectionEntry } from '@/types';
import type { FeatureModuleId, FeatureModuleConfig } from '@/types';
import type { BusinessSettings, BusinessModulesOverride } from '@/types';


// ─── Merge interno ────────────────────────────────────────────────────────────

/**
 * Combina la config base global con los overrides del tenant.
 * Cada capa es opcional; si no hay override, retorna la base sin copia.
 */
function mergeModules(
  base: BusinessModulesConfig,
  override: BusinessModulesOverride,
): BusinessModulesConfig {
  // ── pages: merge shallow por clave ──────────────────────────────────────────
  let pages = base.pages;
  if (override.pages) {
    const pageOverrides = override.pages;
    const mergedPages = { ...base.pages };
    for (const key of Object.keys(pageOverrides) as PageModuleId[]) {
      const pageOverride = pageOverrides[key];
      if (pageOverride !== undefined) {
        mergedPages[key] = { ...base.pages[key], ...pageOverride };
      }
    }
    pages = mergedPages;
  }

  // ── sections: merge enabled + order por clave ─────────────────────────────
  let sections = base.sections;
  if (override.sections) {
    const sectionOverrides = override.sections;
    const mergedSections = { ...base.sections };
    for (const key of Object.keys(sectionOverrides) as SectionModuleId[]) {
      const sectionOverride = sectionOverrides[key];
      if (sectionOverride !== undefined) {
        mergedSections[key] = {
          ...base.sections[key],
          ...(sectionOverride.enabled !== undefined && { enabled: sectionOverride.enabled }),
          ...(sectionOverride.order   !== undefined && { order:   sectionOverride.order }),
        };
      }
    }
    sections = mergedSections;
  }

  // ── features: merge shallow por clave ───────────────────────────────────────────
  let features = base.features;
  if (override.features) {
    const featureOverrides = override.features;
    const mergedFeatures = { ...base.features };
    for (const key of Object.keys(featureOverrides) as FeatureModuleId[]) {
      const featureOverride = featureOverrides[key];
      if (featureOverride !== undefined) {
        mergedFeatures[key] = { ...base.features[key], ...featureOverride };
      }
    }
    features = mergedFeatures;
  }

  return { pages, sections, features };
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Devuelve la configuración modular efectiva del tenant.
 *
 * Si el negocio no tiene overrides persistidos (`business.modules` es undefined),
 * retorna `businessGlobalConfig.modules` directamente sin ninguna copia.
 *
 * @param business - Settings del tenant resuelto. null → fallback global completo.
 */
export function resolveModules(
  business: BusinessSettings | null,
): BusinessModulesConfig {
  const override = business?.modules;
  if (!override) return businessGlobalConfig.modules;
  return mergeModules(businessGlobalConfig.modules, override);
}

/**
 * Devuelve la configuración de un módulo de página específico.
 *
 * @param business - Settings del tenant resuelto (reservado para S4).
 * @param pageId   - Identificador del módulo de página.
 */
export function resolvePageModule(
  business: BusinessSettings | null,
  pageId: PageModuleId,
): PageModuleConfig {
  return resolveModules(business).pages[pageId];
}

/**
 * Devuelve la configuración de un section-module específico.
 *
 * @param business - Settings del tenant resuelto.
 * @param id       - Identificador del section-module.
 */
export function resolveSectionModule(
  business: BusinessSettings | null,
  id: SectionModuleId,
): SectionModuleConfig {
  return resolveModules(business).sections[id];
}

/**
 * Devuelve la configuración de un feature module específico.
 *
 * @param business - Settings del tenant resuelto.
 * @param id       - Identificador del feature module.
 */
export function resolveFeatureModule(
  business: BusinessSettings | null,
  id: FeatureModuleId,
): FeatureModuleConfig {
  return resolveModules(business).features[id];
}

/**
 * Devuelve las secciones de la home activas, ordenadas por `order` ascendente.
 *
 * Filtra por `enabled` y verifica la dependencia declarada en `dependsOn`:
 * - PageModuleId      → el page-module homólogo debe estar enabled
 * - FeatureModuleId   → el feature-module debe estar enabled
 * - 'business.hours'     → business.hours debe tener datos
 * - 'business.location'  → business.location debe existir
 * - 'business.whatsapp'  → business.contact.whatsapp debe existir
 *
 * @param business - Settings del tenant resuelto. null → fallback global.
 */
export function resolveActiveSections(
  business: BusinessSettings | null,
): ResolvedSectionEntry[] {
  const modules = resolveModules(business);

  return (Object.entries(modules.sections) as [SectionModuleId, SectionModuleConfig][])
    .filter(([, config]) => {
      if (!config.enabled) return false;
      if (!config.dependsOn) return true;
      const dep = config.dependsOn;
      if (dep === 'business.hours')    return !!business?.hours?.length;
      if (dep === 'business.location') return !!business?.location;
      if (dep === 'business.whatsapp') return !!business?.contact?.whatsapp;
      if (dep in modules.pages)    return modules.pages[dep as PageModuleId].enabled;
      if (dep in modules.features) return modules.features[dep as FeatureModuleId].enabled;
      return false;
    })
    .map(([id, config]) => ({ id, ...config }))
    .sort((a, b) => a.order - b.order);
}
