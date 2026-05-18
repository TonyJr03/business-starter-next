-- =============================================================================
-- 006_parent_child_integrity_constraints.sql
-- Protege integridad multi-tenant padre-hijo en catalogo y galeria.
--
-- Estas constraints no reemplazan RLS: RLS sigue controlando permisos de
-- lectura/escritura. Las FKs compuestas garantizan que una fila hija no pueda
-- apuntar a un padre de otro negocio.
--
-- Las foreign keys simples existentes se mantienen temporalmente. Quedan
-- redundantes con estas FKs compuestas, pero se dejan intactas para reducir
-- riesgo operativo en esta fase.
-- =============================================================================


-- =============================================================================
-- 1. Prevalidaciones de datos existentes
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM catalog_categories cc
    JOIN catalog_pages cp ON cp.id = cc.catalog_id
    WHERE cc.business_id <> cp.business_id
  ) THEN
    RAISE EXCEPTION 'catalog_categories catalog_id business mismatch';
  END IF;
END;
$$;


DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM catalog_products p
    JOIN catalog_categories cc ON cc.id = p.category_id
    WHERE p.business_id <> cc.business_id
  ) THEN
    RAISE EXCEPTION 'catalog_products category_id business mismatch';
  END IF;
END;
$$;


DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM gallery_photos gp
    JOIN gallery_albums ga ON ga.id = gp.album_id
    WHERE gp.business_id <> ga.business_id
  ) THEN
    RAISE EXCEPTION 'gallery_photos album_id business mismatch';
  END IF;
END;
$$;


-- =============================================================================
-- 2. Unique constraints necesarias para FKs compuestas
-- =============================================================================

ALTER TABLE catalog_pages
  ADD CONSTRAINT catalog_pages_business_id_id_key UNIQUE (business_id, id);

ALTER TABLE catalog_categories
  ADD CONSTRAINT catalog_categories_business_id_id_key UNIQUE (business_id, id);

ALTER TABLE gallery_albums
  ADD CONSTRAINT gallery_albums_business_id_id_key UNIQUE (business_id, id);


-- =============================================================================
-- 3. Foreign keys compuestas por negocio
-- =============================================================================

ALTER TABLE catalog_categories
  ADD CONSTRAINT catalog_categories_business_catalog_fk
  FOREIGN KEY (business_id, catalog_id)
  REFERENCES catalog_pages (business_id, id)
  ON DELETE CASCADE;

ALTER TABLE catalog_products
  ADD CONSTRAINT catalog_products_business_category_fk
  FOREIGN KEY (business_id, category_id)
  REFERENCES catalog_categories (business_id, id)
  ON DELETE CASCADE;

ALTER TABLE gallery_photos
  ADD CONSTRAINT gallery_photos_business_album_fk
  FOREIGN KEY (business_id, album_id)
  REFERENCES gallery_albums (business_id, id)
  ON DELETE CASCADE;
