/**
 * Section — Server Component
 *
 * Wrapper de sección con ancho máximo, padding vertical y fondo configurable.
 * Equivalente de Section.astro.
 *
 * @prop bg    - Color de fondo de la sección
 * @prop size  - Padding vertical
 * @prop id    - ID para anclas de navegación
 */
import type { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  bg?: 'default' | 'surface' | 'secondary' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  id?: string
  className?: string
}

const bgStylesMap: Record<string, React.CSSProperties> = {
  default:   { backgroundColor: 'var(--color-bg)' },
  surface:   { backgroundColor: 'var(--color-surface)' },
  secondary: { backgroundColor: 'var(--color-secondary)' },
  primary:   { backgroundColor: 'var(--color-primary)', color: 'white' },
}

const paddings: Record<string, string> = {
  sm: 'py-8',
  md: 'py-16',
  lg: 'py-24',
}

export function Section({ children, bg = 'default', size = 'md', id, className }: SectionProps) {
  return (
    <section
      id={id}
      className={`w-full ${paddings[size]} ${className ?? ''}`}
      style={bgStylesMap[bg]}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}
