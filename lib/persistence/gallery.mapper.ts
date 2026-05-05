import type { GalleryAlbum, GalleryPhoto } from '@/types';

// ─── Album ────────────────────────────────────────────────────────────────────

export interface GalleryAlbumRow {
  id: string;
  business_id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function rowToGalleryAlbum(row: GalleryAlbumRow): GalleryAlbum {
  return {
    id:          row.id,
    slug:        row.slug,
    name:        row.name,
    description: row.description ?? undefined,
    sortOrder:   row.sort_order,
    isActive:    row.is_active,
  };
}

// ─── Photo ────────────────────────────────────────────────────────────────────

export interface GalleryPhotoRow {
  id: string;
  business_id: string;
  album_id: string;
  image_url: string;
  alt: string;
  caption: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function rowToGalleryPhoto(row: GalleryPhotoRow): GalleryPhoto {
  return {
    id:        row.id,
    albumId:   row.album_id,
    imageUrl:  row.image_url,
    alt:       row.alt,
    caption:   row.caption ?? undefined,
    sortOrder: row.sort_order,
    isActive:  row.is_active,
  };
}
