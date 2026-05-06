import { cache } from 'react';
import type { GalleryAlbum, GalleryPhoto } from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  type GalleryAlbumRow, rowToGalleryAlbum,
  type GalleryPhotoRow, rowToGalleryPhoto,
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

async function fetchGalleryPhotosFromDB(businessId: string): Promise<GalleryPhoto[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const db = await createSupabaseServerClient();

  const { data, error } = await db
    .from('gallery_photos')
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

  return (data as GalleryPhotoRow[]).map(rowToGalleryPhoto);
}

// ─── Derived ──────────────────────────────────────────────────────────────────

async function fetchPhotosByAlbum(businessId: string, albumId: string): Promise<GalleryPhoto[]> {
  const all = await getGalleryPhotos(businessId);
  return all.filter((p) => p.albumId === albumId);
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const getGalleryAlbums = cache(fetchGalleryAlbumsFromDB);
export const getGalleryPhotos = cache(fetchGalleryPhotosFromDB);
export const getPhotosByAlbum = cache(fetchPhotosByAlbum);
