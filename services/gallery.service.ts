import { cache } from 'react';
import type { GalleryAlbum, GalleryItem } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  type GalleryAlbumRow, rowToGalleryAlbum,
  type GalleryPhotoRow, rowToGalleryItem,
} from '@/lib/persistence';

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchGalleryAlbumsFromDB(businessId: string): Promise<GalleryAlbum[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('gallery_albums')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[gallery.service] Error:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as GalleryAlbumRow[]).map(rowToGalleryAlbum);
}

async function fetchGalleryPhotosFromDB(
  businessId: string,
  albumId?: string,
): Promise<GalleryItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  let query = db
    .from('gallery_photos')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order');

  if (albumId) {
    query = query.eq('album_id', albumId);
  }

  const { data, error } = await query;

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[gallery.service] Error:', error.message);
    }
    return [];
  }

  if (!data || data.length === 0) return [];

  return (data as GalleryPhotoRow[]).map(rowToGalleryItem);
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const getGalleryAlbums = cache(fetchGalleryAlbumsFromDB);
export const getGalleryPhotos = cache(fetchGalleryPhotosFromDB);
