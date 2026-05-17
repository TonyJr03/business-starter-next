/** Un álbum de la galería que agrupa fotos bajo un nombre. */
export interface GalleryAlbum {
  id: string;
  /** Slug seguro para URL (ej. 'nuestro-espacio'). */
  slug: string;
  name: string;
  description?: string;
  /** Posición en el listado (menor = primero). */
  sortOrder?: number;
  /** Controla la visibilidad; se asume true si se omite. */
  isActive?: boolean;
}

/** Una imagen individual de la galería. */
export interface GalleryPhoto {
  id: string;
  /** ID del álbum al que pertenece esta foto. */
  albumId: string;
  imageUrl: string;
  /** Texto alternativo accesible. */
  alt: string;
  /** Pie de foto opcional. */
  caption?: string;
  /** Posición en el álbum (menor = primero). */
  sortOrder?: number;
  /** Controla la visibilidad; se asume true si se omite. */
  isActive?: boolean;
}
