/**
 * FeatureIcon — Server Component
 *
 * Renderiza el icono de un ContentFeature (diferenciador / highlight) a partir
 * del string almacenado en `icon`. Los iconos están en SVG inline para evitar
 * dependencias de cliente y garantizar SSR limpio.
 *
 * Iconos soportados: coffee, heart, map-pin, star (+ fallback check genérico).
 * El admin ingresa el nombre en el campo "Ícono" del formulario de diferenciadores.
 */

interface FeatureIconProps {
  icon?: string
  className?: string
}

export function FeatureIcon({ icon, className = 'size-5' }: FeatureIconProps) {
  const style = { color: 'var(--color-primary)' }
  const shared = { xmlns: 'http://www.w3.org/2000/svg', className, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', style, 'aria-hidden': true as const }
  const path = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2 }

  if (icon === 'coffee') return (
    <svg {...shared}>
      <path {...path} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
    </svg>
  )
  if (icon === 'heart') return (
    <svg {...shared}>
      <path {...path} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
  if (icon === 'map-pin') return (
    <svg {...shared}>
      <path {...path} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path {...path} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
  if (icon === 'star') return (
    <svg {...shared}>
      <path {...path} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )
  // Fallback: check genérico
  return (
    <svg {...shared}>
      <path {...path} d="M5 13l4 4L19 7" />
    </svg>
  )
}
