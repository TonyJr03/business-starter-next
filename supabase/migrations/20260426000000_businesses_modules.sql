-- =============================================================================
-- Migración: añadir columna modules a businesses
-- Fecha: 2026-04-26
--
-- Permite almacenar overrides modulares por tenant sin reemplazar la
-- configuración base global definida en `config/business-config.ts`.
--
-- Estrategia de resolución en `lib/modules/resolver.ts`:
--   1. businesses.modules (DB)  → overrides por tenant (este campo)
--   2. globalConfig.modules     → base global del starter (fallback)
--
-- El merge es parcial y aditivo: solo las claves presentes en el override
-- sobreescriben la base. Un tenant que no tenga `modules` en BD opera
-- exactamente igual que antes de esta migración.
--
-- Estructura del JSONB (BusinessModulesOverride):
--
--   {
--     pages?: {
--       [pageId]: {              -- pageId: catalog | promotions | about | contact | faq | gallery | blog
--         enabled?: boolean,
--         navLabel?: string,
--         title?: string,
--         subtitle?: string,
--         featuredTitle?: string,
--         emptyMessage?: string
--       }
--     },
--     sections?: {
--       [sectionId]: {           -- sectionId: hero | highlights | promotions | testimonials | whatsapp_cta | location | hours
--         enabled?: boolean,
--         order?: number
--       }
--     },
--     features?: {
--       [featureId]: {           -- featureId: cart | whatsappOrdering
--         enabled?: boolean
--       }
--     }
--   }
--
-- Nota: las props visuales de secciones (title, bg, size…) y el path de
-- los page modules se gestionan en globalConfig (código), no aquí.
-- Este campo solo almacena la parte operativa de los overrides.
-- =============================================================================

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS modules JSONB;

COMMENT ON COLUMN businesses.modules IS
  'Overrides modulares del negocio. JSONB con estructura BusinessModulesOverride:
{
  pages?:    { [pageId]:    { enabled?, navLabel?, title?, subtitle?, featuredTitle?, emptyMessage? } },
  sections?: { [sectionId]: { enabled?, order? } },
  features?: { [featureId]: { enabled? } }
}.
NULL = usar globalConfig.modules completo sin modificaciones.
Solo se almacenan las diferencias respecto a la configuración base global.';
