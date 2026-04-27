'use client'

/**
 * MobileMenu — Client Component
 *
 * Maneja el toggle del menú de navegación móvil.
 * Separado como Client Component para mantener el Header como Server Component.
 */

import { useState } from 'react'
import { NavLink } from './NavLink'
import type { NavItem } from '@/types'

interface MobileMenuProps {
  nav: NavItem[]
  whatsappUrl?: string
}

export function MobileMenu({ nav, whatsappUrl }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        className="md:hidden p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2"
        style={{ color: 'var(--color-text-muted)', ['--tw-ring-color' as string]: 'var(--color-primary)' }}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Menú móvil desplegable */}
      {open && (
        <nav
          id="mobile-nav"
          className="absolute top-16 left-0 right-0 z-40 border-t shadow-md"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: 'var(--color-border-subtle)',
          }}
          onClick={() => setOpen(false)}
        >
          <ul className="flex flex-col px-4 py-3 gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  label={item.label}
                  isExternal={item.isExternal}
                  className="block px-2 py-2 text-sm font-medium rounded-md transition-colors"
                />
              </li>
            ))}

            {whatsappUrl && (
            <li className="pt-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-green-600"
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75.75 0 0 0 .915.915l5.573-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 0 1-4.953-1.36l-.355-.212-3.683.972.985-3.595-.231-.37A9.694 9.694 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                </svg>
                WhatsApp
              </a>
            </li>
            )}
          </ul>
        </nav>
      )}
    </>
  )
}
