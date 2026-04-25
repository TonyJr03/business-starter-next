/**
 * GalleryGrid — Server Component
 *
 * Grid responsivo de imágenes con caption opcional.
 * Renderiza imágenes en layout de columnas múltiples con hover suave.
 */
import Image from 'next/image'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
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

const sizesMap: Record<number, string> = {
  2: '(max-width: 640px) 100vw, 50vw',
  3: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  4: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
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

      {title && <SectionHeading title={title} subtitle={subtitle} />}

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
            <figure>
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes={sizesMap[columns]}
                />
              </div>
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
