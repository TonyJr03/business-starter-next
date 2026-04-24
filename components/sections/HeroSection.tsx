/**
 * HeroSection — Server Component
 *
 * Sección hero configurable, desacoplada del dominio.
 * Equivalente de HeroSection.astro.
 */
import { Button } from '@/components/ui/Button'
import type { HeroSectionProps } from '@/types/section-modules'

const bgStyles: Record<string, string> = {
  secondary: 'var(--color-secondary)',
  primary:   'var(--color-primary)',
  surface:   'var(--color-surface)',
  default:   'var(--color-bg)',
}

const paddings: Record<string, string> = {
  sm: 'py-12',
  md: 'py-20',
  lg: 'py-28',
}

export function HeroSection({
  title,
  tagline,
  subtitle,
  primaryCta,
  secondaryCta,
  align = 'center',
  bg = 'secondary',
  size = 'lg',
}: HeroSectionProps) {
  const onPrimary = bg === 'primary'
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <section
      className={`w-full px-4 ${paddings[size]}`}
      style={{ backgroundColor: bgStyles[bg], color: onPrimary ? 'white' : undefined }}
    >
      <div className={`max-w-3xl mx-auto flex flex-col gap-6 ${alignClass}`}>

        {tagline && (
          <p
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: onPrimary ? 'rgba(255,255,255,0.8)' : 'var(--color-accent)' }}
          >
            {tagline}
          </p>
        )}

        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
          style={{ color: onPrimary ? 'white' : 'var(--color-primary)' }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="text-lg sm:text-xl leading-relaxed max-w-2xl"
            style={{ color: onPrimary ? 'rgba(255,255,255,0.85)' : 'var(--color-text-muted)' }}
          >
            {subtitle}
          </p>
        )}

        {(primaryCta || secondaryCta) && (
          <div
            className={`flex flex-col sm:flex-row gap-4 pt-2 ${align === 'center' ? 'justify-center' : ''}`}
          >
            {primaryCta && (
              <Button
                href={primaryCta.href}
                variant={onPrimary ? 'outline' : 'primary'}
                size="md"
              >
                {primaryCta.label}
              </Button>
            )}
            {secondaryCta && (
              <Button href={secondaryCta.href} variant="outline" size="md">
                {secondaryCta.label}
              </Button>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
