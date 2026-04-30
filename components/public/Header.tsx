/**
 * Header — Server Component
 *
 * Cabecera del sitio público del negocio.
 *
 * - Logo / nombre del negocio como enlace a la home del tenant
 * - Navegación desktop construida desde los módulos de página activos
 * - Si hay 2+ catálogos, el item "Catálogo" se convierte en dropdown
 * - Botón WhatsApp en desktop
 * - MobileMenu (Client Component) para el toggle móvil
 */

import Link from 'next/link'
import { resolveModules } from '@/lib/modules/resolver'
import { MobileMenu } from './MobileMenu'
import { NavLink } from './NavLink'
import type { BusinessSettings, Catalog } from '@/types'
import type { NavItem } from '@/types'
import type { PageModuleConfig } from '@/types'

interface HeaderProps {
  business: BusinessSettings
  slug: string
  catalogs: Catalog[]
}

/** Construye la navegación del tenant prefijando las rutas con /negocios/[slug]. */
function buildTenantNav(business: BusinessSettings, slug: string, catalogs: Catalog[]): NavItem[] {
  const base = `/negocios/${slug}`
  const { pages } = resolveModules(business)

  const pageItems = (Object.values(pages) as PageModuleConfig[])
    .filter((mod) => mod.enabled)
    .map((mod): NavItem => {
      // Item de catálogo con múltiples catálogos → dropdown
      if (mod.path === '/catalog' && catalogs.length >= 2) {
        return {
          label: mod.navLabel,
          href: `${base}/catalog`,
          children: catalogs.map((cat) => ({
            label: cat.name,
            href: `${base}/catalog/${cat.slug}`,
          })),
        }
      }
      // Item normal o catálogo único → enlace directo al primer catálogo
      if (mod.path === '/catalog' && catalogs.length === 1) {
        return { label: mod.navLabel, href: `${base}/catalog/${catalogs[0].slug}` }
      }
      return { label: mod.navLabel, href: `${base}${mod.path}` }
    })

  return [{ label: 'Inicio', href: base }, ...pageItems]
}

export function Header({ business, slug, catalogs }: HeaderProps) {
  const nav = buildTenantNav(business, slug, catalogs)

  const waNumber = business.whatsapp?.replace(/\D/g, '')
  const whatsappUrl = waNumber ? `https://wa.me/${waNumber}` : undefined

  return (
    <header
      className="sticky top-0 z-50 shadow-sm"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo / Nombre */}
          <Link
            href={`/negocios/${slug}`}
            className="text-xl font-bold shrink-0"
            style={{ color: 'var(--color-primary)' }}
          >
            {business.name}
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {nav.map((item) =>
              item.children ? (
                // Dropdown de catálogos
                <div key={item.href} className="relative group">
                  <button
                    className="flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 opacity-60">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div
                    className="absolute left-0 top-full pt-2 hidden group-hover:block min-w-40 z-50"
                  >
                    <ul
                      className="flex flex-col rounded-xl border shadow-md overflow-hidden"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                    >
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <NavLink
                            href={child.href}
                            label={child.label}
                            className="block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-(--color-secondary)"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  isExternal={item.isExternal}
                />
              )
            )}

            {/* CTA WhatsApp */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-green-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75.75 0 0 0 .915.915l5.573-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 0 1-4.953-1.36l-.355-.212-3.683.972.985-3.595-.231-.37A9.694 9.694 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                </svg>
                WhatsApp
              </a>
            )}
          </nav>

          {/* Menú móvil (Client Component) */}
          <MobileMenu nav={nav} whatsappUrl={whatsappUrl} />
        </div>
      </div>
    </header>
  )
}
