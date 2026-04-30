/**
 * GalleryAlbumBar — Server Component
 *
 * Barra horizontal de píldoras para filtrar la galería por álbum.
 * El filtro activo se determina por el query param `album` de la URL.
 * Cada píldora es un `<a>` simple — no requiere JS.
 *
 * Uso:
 *   <GalleryAlbumBar albums={albums} activeSlug={searchParams.album} basePath="/negocios/mi-neg/gallery" />
 */
import Link from 'next/link';
import type { GalleryAlbum } from '@/types';

interface GalleryAlbumBarProps {
  albums: GalleryAlbum[];
  /** Slug del álbum activo (de searchParams.album). Undefined = "Todos". */
  activeSlug?: string;
  /** Ruta base de la galería sin trailing slash (ej. "/negocios/cafe/gallery"). */
  basePath: string;
}

export function GalleryAlbumBar({ albums, activeSlug, basePath }: GalleryAlbumBarProps) {
  if (albums.length === 0) return null;

  const allActive = !activeSlug;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 px-4 py-4 w-max mx-auto sm:w-auto sm:flex-wrap sm:justify-center sm:px-0">
        {/* Píldora "Todos" */}
        <Link
          href={basePath}
          className={[
            'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            allActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          ].join(' ')}
          aria-current={allActive ? 'true' : undefined}
        >
          Todos
        </Link>

        {albums.map((album) => {
          const isActive = album.slug === activeSlug;
          return (
            <Link
              key={album.id}
              href={`${basePath}?album=${album.slug}`}
              className={[
                'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              ].join(' ')}
              aria-current={isActive ? 'true' : undefined}
            >
              {album.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
