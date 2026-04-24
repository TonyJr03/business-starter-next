-- =============================================================================
-- Políticas de escritura para el panel admin
-- Fecha: 2026-04-24
--
-- Permite a usuarios autenticados (admin) hacer INSERT / UPDATE / DELETE
-- en las tablas de dominio. La política de SELECT pública ya existe.
--
-- Aislamiento multi-tenant:
--   · La aplicación siempre filtra por business_id (app-layer enforcement).
--   · RLS autentica al usuario; la app garantiza que solo toca su negocio.
-- =============================================================================

-- ─── categories ──────────────────────────────────────────────────────────────

CREATE POLICY "admin_insert_categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_update_categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_delete_categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- ─── products ─────────────────────────────────────────────────────────────────

CREATE POLICY "admin_insert_products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_update_products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_delete_products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- ─── promotions ───────────────────────────────────────────────────────────────

CREATE POLICY "admin_insert_promotions"
  ON promotions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_update_promotions"
  ON promotions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_delete_promotions"
  ON promotions FOR DELETE
  TO authenticated
  USING (true);

-- ─── businesses ───────────────────────────────────────────────────────────────

CREATE POLICY "admin_update_businesses"
  ON businesses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
