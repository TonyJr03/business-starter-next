-- =============================================================================
-- Migración: ampliar businesses con settings básicos del negocio
-- Fecha: 2026-04-19
--
-- Estrategia: extender la tabla `businesses` en lugar de crear
-- `business_settings` separada, porque:
--   · Todos los campos son propiedades 1:1 del negocio (no 1:N)
--   · Sin JOIN — el service lee una fila y obtiene todo
--   · Escala bien en multi-tenant (cada fila = configuración completa)
--   · JSONB para social y hours: su estructura interna es variable/extensible
--
-- Campos añadidos:
--   short_description  → identity.shortDescription
--   whatsapp           → contact.whatsapp (contacto primario)
--   phone              → contact.phone
--   email              → contact.email
--   address            → calle + municipio legibles (ej. "Calle 23 esq. a L, Vedado")
--   city               → location.city
--   country            → location.country
--   social             → BusinessSocial  { instagram?, facebook?, telegram?, … }
--   hours              → DayHours[]     [{ day, open, close, isClosed }, …]
--
-- Todos los campos son nullable para mantener compatibilidad con filas
-- existentes y con la estrategia de fallback a globalConfig.
-- =============================================================================

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS short_description  TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp           TEXT,
  ADD COLUMN IF NOT EXISTS phone              TEXT,
  ADD COLUMN IF NOT EXISTS email              TEXT,
  ADD COLUMN IF NOT EXISTS address            TEXT,
  ADD COLUMN IF NOT EXISTS city               TEXT,
  ADD COLUMN IF NOT EXISTS country            TEXT,
  ADD COLUMN IF NOT EXISTS social             JSONB,
  ADD COLUMN IF NOT EXISTS hours              JSONB;

-- Comentarios para documentación introspectiva del esquema
COMMENT ON COLUMN businesses.short_description IS
  'Descripción breve de una línea (footer, meta tags). Mapeada a identity.shortDescription.';
COMMENT ON COLUMN businesses.whatsapp IS
  'Número de WhatsApp en formato E.164, ej. +5350000000. Campo de contacto primario.';
COMMENT ON COLUMN businesses.phone IS
  'Teléfono fijo / móvil adicional en formato E.164.';
COMMENT ON COLUMN businesses.email IS
  'Email de contacto público del negocio.';
COMMENT ON COLUMN businesses.address IS
  'Dirección postal legible: calle, municipio. Ciudad y país van en city/country.';
COMMENT ON COLUMN businesses.city IS
  'Ciudad donde opera el negocio.';
COMMENT ON COLUMN businesses.country IS
  'País donde opera el negocio.';
COMMENT ON COLUMN businesses.social IS
  'Redes sociales del negocio. Objeto JSON: { instagram?, facebook?, telegram?, … }.
Ejemplo: {"instagram": "https://instagram.com/micafe", "telegram": "@micafe"}';
COMMENT ON COLUMN businesses.hours IS
  'Horario semanal. Array JSON de DayHours: [{ day, open, close, isClosed }, …].
Ejemplo: [{"day":"Lunes","open":"08:00","close":"22:00","isClosed":false}]';
