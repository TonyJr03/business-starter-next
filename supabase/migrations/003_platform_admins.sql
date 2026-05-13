-- =============================================================================
-- 003_platform_admins.sql
-- Tabla de administradores de plataforma (superadmins).
-- Separa el rol de plataforma de la autenticación de tenants.
--
-- Estrategia: tabla separada (no columna `role` en auth.users) para:
--   · No depender de user_metadata (mutable por el propio usuario)
--   · RLS granular: solo un service_role o superadmin puede insertar
--   · Auditoría limpia: sabemos quién concedió el acceso y cuándo
-- =============================================================================

CREATE TABLE platform_admins (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Lectura: solo el propio usuario puede ver si es superadmin
CREATE POLICY "platform_admins_select_self"
  ON platform_admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert/Delete: solo service_role (migraciones, CLI, funciones Edge)
-- No hay política para authenticated → los usuarios no pueden auto-asignarse el rol

-- =============================================================================
-- Política INSERT en businesses para superadmins
-- Los platform_admins pueden crear nuevos negocios desde el panel superadmin.
-- UPDATE: cualquier authenticated user puede actualizar (se tightens en Step 10).
-- =============================================================================

CREATE POLICY "businesses_insert_superadmin"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE user_id = auth.uid()
    )
  );

