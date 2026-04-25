/**
 * SectionHeading — Server Component
 *
 * Encabezado de sección reutilizable: h2 + subtítulo opcional.
 * Garantiza uniformidad visual en todas las secciones del sitio.
 *
 * @prop className — clases del wrapper combinadas con 'text-center'.
 *                   Úsalo para controlar espaciado inferior y ancho máximo
 *                   (ej. 'mb-12 max-w-2xl mx-auto'). Por defecto: 'mb-10'.
 */

interface SectionHeadingProps {
  title: string
  subtitle?: string
  /** Clases adicionales del wrapper (siempre incluye 'text-center'). Por defecto: 'mb-10'. */
  className?: string
}

export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  return (
    <div className={`text-center ${className ?? 'mb-10'}`}>
      <h2 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-3 text-base leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
