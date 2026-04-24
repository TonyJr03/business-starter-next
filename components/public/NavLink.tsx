'use client'

/**
 * NavLink — Client Component
 *
 * Link que resalta si la ruta actual coincide con su `href`.
 * Solución simple para active link highlighting sin sobreingeniería.
 *
 * Uso:
 *   <NavLink href="/about" label="Nosotros" />
 *
 * Estilos:
 *   - Ruta activa: color primario + borde inferior
 *   - Hover: opacidad reducida
 *   - Foco: outline visible
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  label: string
  isExternal?: boolean
  className?: string
  activeClassName?: string
}

export function NavLink({
  href,
  label,
  isExternal = false,
  className = 'text-sm font-medium transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:underline',
  activeClassName = 'border-b-2',
}: NavLinkProps) {
  const pathname = usePathname()

  // Resalta si:
  // - El pathname coincide exactamente, o
  // - El pathname comienza con href (para subrutas)
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`${className} ${isActive ? activeClassName : ''}`}
      style={{
        color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
        borderBottomColor: isActive ? 'var(--color-primary)' : 'transparent',
        paddingBottom: '0.25rem',
      }}
    >
      {label}
    </Link>
  )
}
