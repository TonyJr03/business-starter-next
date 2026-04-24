/**
 * GalleryGrid — Server Component
 *
 * Grid responsivo de imágenes con caption opcional.
 * Renderiza imágenes en layout de columnas múltiples con hover suave.
 *
 * Equivalente de GalleryGrid.astro.
 */
import { Section } from '@/components/ui/Section'
import type { GalleryItem } from '@/types'

interface GalleryGridProps {
  items: GalleryItem[]
  title?: string
  subtitle?: string
  columns?: 2 | 3 | 4
  bg?: 'default' | 'surface' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

const gridColsMap: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function GalleryGrid({
  items,
  title,
  subtitle,
  columns = 3,
  bg = 'default',
  size = 'md',
}: GalleryGridProps) {
  return (
    <Section bg={bg} size={size}>

      {(title || subtitle) && (
        <div className="text-center mb-10">
          {title && (
            <h2
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="mt-2 text-base"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <ul
        className={`grid gap-4 ${gridColsMap[columns]}`}
        role="list"
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="overflow-hidden rounded-xl group"
            style={{ boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.1))' }}
          >
            <figure className="relative h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                style={{ aspectRatio: '4/3' }}
              />
              {item.caption && (
                <figcaption
                  className="px-3 py-2 text-xs text-center leading-snug"
                  style={{
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  {item.caption}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

    </Section>
  )
}
