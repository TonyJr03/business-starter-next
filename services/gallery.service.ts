import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { GalleryAlbum, GalleryItem } from '@/types';
import {
  type GalleryAlbumRow, rowToGalleryAlbum,
  type GalleryPhotoRow, rowToGalleryItem,
} from '@/lib/persistence/gallery';

/**
 * Servicio de galería — lectura desde BD.
 *
 * Fuente de datos: tablas `gallery_albums` y `gallery_photos`.
 * Ambas funciones degradan a array vacío si Supabase no está disponible
 * o el negocio no tiene datos — la página galería muestra el estado vacío.
 *
 * Contrato estable: las firmas públicas no cambian al migrar la fuente.
 */

// ─── Albums ───────────────────────────────────────────────────────────────────

async function fetchGalleryAlbumsFromDB(businessId: string): Promise<GalleryAlbum[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('gallery_albums')
    .select('id, business_id, slug, name, description, cover_image_url, sort_order, is_active, created_at, updated_at')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[gallery.service] Error al leer gallery_albums:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as GalleryAlbumRow[]).map(rowToGalleryAlbum);
}

export const getGalleryAlbums = cache(fetchGalleryAlbumsFromDB);

// ─── Photos ───────────────────────────────────────────────────────────────────

async function fetchGalleryPhotosFromDB(
  businessId: string,
  albumId?: string,
): Promise<GalleryItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  let query = db
    .from('gallery_photos')
    .select('id, business_id, album_id, image_url, alt, caption, sort_order, is_active, created_at, updated_at')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order');

  if (albumId) {
    query = query.eq('album_id', albumId);
  }

  const { data, error } = await query;

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[gallery.service] Error al leer gallery_photos:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as GalleryPhotoRow[]).map(rowToGalleryItem);
}

export const getGalleryPhotos = cache(fetchGalleryPhotosFromDB);
