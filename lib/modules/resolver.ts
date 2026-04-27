/**
 * Module resolver — estrategia de resolución base + override
 *
 * Punto de entrada único para obtener la configuración modular efectiva
 * de un tenant. Centraliza la lógica de merge entre:
 *   - `globalConfig.modules` (base: definido en código, aplica a todos los tenants)
 *   - overrides por tenant (futuro S4: vendrán de la tabla `businesses` en Supabase)
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Estrategia de resolución (tres fases):
 *
 *   S3 (actual): base pura
 *     resolveModules(business) → globalConfig.modules
 *     No hay overrides; `business` se acepta en firma para estabilizar callers.
 *
 *   S4 (próximo): merge DB → base
 *     business.modules (DB) se fusiona sobre globalConfig.modules como defaults.
 *     Callers no cambian — solo cambia esta función.
 *
 *   S5+ (futuro): merge jerárquico
 *     platform defaults → tenant overrides → feature flags dinámicos
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Uso:
 *
 *   import { resolveModules, resolveActiveSections } from '@/lib/modules/resolver'
 *
 *   // En un Server Component o page:
 *   const modules = resolveModules(business)
 *   const sections = resolveActiveSections(business)
 */

import { globalConfig } from '@/config';
import type { BusinessModulesConfig, SectionModuleEntry } from '@/types';
import type { PageModuleId, PageModuleConfig } from '@/types';
import type { BusinessSettings } from '@/types';

// ─── Resolvers ────────────────────────────────────────────────────────────────

/**
 * Devuelve la configuración modular efectiva del tenant.
 *
 * Hoy retorna `globalConfig.modules` directamente.
 * En S4: mergea `business.modules` (overrides de DB) sobre la base global.
 *
 * @param _business - Settings del tenant resuelto. Reservado para S4.
 */
export function resolveModules(
  _business: BusinessSettings | null,
): BusinessModulesConfig {
  // S4: merge business.modules ?? globalConfig.modules
  return globalConfig.modules;
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
 * Uso actual (S3): equivalente a `globalConfig.modules.pages[pageId]`.
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
