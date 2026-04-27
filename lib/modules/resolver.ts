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
import type { BusinessModulesConfig, SectionModuleEntry } from '@/types';
import type { PageModuleId, PageModuleConfig } from '@/types';
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

  // ── sections: merge enabled + order por id ──────────────────────────────────
  // Las props visuales son config global — no se tocan.
  let sections = base.sections;
  if (override.sections) {
    const sectionOverrides = override.sections;
    sections = base.sections.map((entry) => {
      const sectionOverride = sectionOverrides[entry.id];
      if (!sectionOverride) return entry;
      return {
        ...entry,
        ...(sectionOverride.enabled !== undefined && { enabled: sectionOverride.enabled }),
        ...(sectionOverride.order   !== undefined && { order:   sectionOverride.order }),
      };
    });
  }

  // ── features: merge shallow por clave ───────────────────────────────────────
  let features = base.features;
  if (override.features) {
    features = { ...base.features };
    for (const [key, val] of Object.entries(override.features)) {
      if (val !== undefined) {
        const featureKey = key as keyof typeof base.features;
        features = {
          ...features,
          [featureKey]: { ...base.features[featureKey], ...val },
        };
      }
    }
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
 * Devuelve las secciones de la home activas, ordenadas por `order` ascendente.
 *
 * Encapsula el filter + sort para que los callers no repitan esta lógica
 * y para que el comportamiento pueda cambiar con overrides por tenant en S4.
 *
 * @param business - Settings del tenant resuelto. Reservado para S4.
 */
export function resolveActiveSections(
  business: BusinessSettings | null,
): SectionModuleEntry[] {
  const { sections } = resolveModules(business);
  return sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
}

/**
 * Devuelve la configuración de un módulo de página específico.
 *
 * Uso actual (S3): equivalente a `businessGlobalConfig.modules.pages[pageId]`.
 * En S4: retornará la config mergeada con overrides de DB.
 *
 * Patrón recomendado en pages para S4:
 *
 *   const pageModule = resolvePageModule(business, 'catalog')
 *   if (!pageModule.enabled) notFound()
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
