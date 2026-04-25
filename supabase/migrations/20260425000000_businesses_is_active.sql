-- =============================================================================
-- Migración: añadir is_active a businesses para el directorio público
-- Fecha: 2026-04-25
--
-- Motivación:
--   El directorio de la plataforma central (M8) necesita filtrar negocios
--   publicables. Se añade `is_active` como columna de ciclo de vida simple:
--     true  → visible en el directorio
--     false → oculto (borrado suave, mantenimiento, demo interna, etc.)
--
-- Default true → los negocios existentes quedan visibles automáticamente.
-- Sin ruptura en código existente: las consultas que no lo incluyan siguen
-- funcionando igual.
-- =============================================================================

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN businesses.is_active IS
  'Controla la visibilidad en el directorio público de la plataforma.
true = negocio activo y publicable; false = oculto (mantenimiento, demo, borrado suave).';

-- Índice para acelerar el filtro del directorio (WHERE is_active = true).
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON businesses (is_active);
