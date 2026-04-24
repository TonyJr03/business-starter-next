/**
 * CategoryNav — Server Component
 *
 * Barra sticky de navegación por anclas entre categorías del catálogo.
 * Renderiza enlaces #slug hacia cada sección. Scroll horizontal en móvil.
 * Se omite si hay una sola categoría.
 *
 * Equivalente de CategoryNav.astro.
 */
import type { Category } from '@/types'

interface CategoryNavProps {
  categories: Category[]
}

export function CategoryNav({ categories }: CategoryNavProps) {
  if (categories.length <= 1) return null

  return (
    <nav
      aria-label="Categorías del menú"
      className="sticky top-0 z-10 w-full overflow-x-auto border-b"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      <ul className="flex gap-1 px-4 py-2 max-w-4xl mx-auto min-w-max sm:min-w-0 sm:flex-wrap">
        {categories.map((cat) => (
          <li key={cat.id}>
            <a
              href={`#${cat.slug}`}
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap hover:bg-(--color-secondary) hover:text-(--color-primary)"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {cat.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
