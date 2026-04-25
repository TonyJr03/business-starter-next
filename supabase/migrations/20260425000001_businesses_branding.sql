-- =============================================================================
-- Migración: añadir columna branding a businesses
-- Fecha: 2026-04-25
--
-- Permite almacenar la configuración de marca de cada negocio en la BD,
-- habilitando branding por-tenant sin despliegues de código.
--
-- Estrategia de fallback en el tenant layout (app/negocios/[slug]/layout.tsx):
--   1. businesses.branding (DB)   → override por tenant (este campo)
--   2. globalConfig.branding      → fallback estático del starter
--   3. BRAND_DEFAULTS en branding/index.ts → valores hardcoded del sistema
--
-- Estructura del JSONB (BusinessBranding):
--   {
--     themeKey?: string,
--     colors?: {
--       primary?, secondary?, accent?,
--       footerBg?, footerText?, footerTextMuted?, footerBorder?
--     },
--     typography?: { heading?, body? }
--   }
-- =============================================================================

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS branding JSONB;

COMMENT ON COLUMN businesses.branding IS
  'Configuración de marca visual del negocio. JSONB con estructura BusinessBranding:
{ themeKey?, colors?: { primary?, secondary?, accent?, footerBg?, … }, typography?: { heading?, body? } }.
NULL = usar branding de globalConfig del starter.';
