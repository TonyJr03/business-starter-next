/**
 * Button — Server Component
 *
 * Botón / enlace reutilizable con variantes de estilo.
 * Equivalente de Button.astro.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  target?: string
  rel?: string
  'aria-label'?: string
}

const base = [
  'inline-flex items-center justify-center gap-2 cursor-pointer',
  'font-semibold rounded-full transition-all',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
].join(' ')

const variants: Record<string, string> = {
  primary: 'text-white hover:opacity-90 active:opacity-80',
  outline: [
    'border-2 bg-transparent',
    'hover:text-white hover:opacity-90',
    'active:opacity-90',
  ].join(' '),
  ghost: 'bg-transparent hover:opacity-80 active:opacity-60',
}

const sizes: Record<string, string> = {
  sm: 'px-5 py-1.5 text-sm',
  md: 'px-8 py-3 text-base',
  lg: 'px-10 py-4 text-lg',
}

function getInlineStyle(variant: string): React.CSSProperties {
  if (variant === 'primary') return { backgroundColor: 'var(--color-primary)' }
  if (variant === 'outline') return { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
  return { color: 'var(--color-primary)' }
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  type = 'button',
  disabled,
  className,
  target,
  rel,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className ?? ''}`
  const style = getInlineStyle(variant)

  if (href) {
    return (
      <Link
        href={href}
        className={cls}
        style={style}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={cls}
      style={style}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}
