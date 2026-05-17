import Link from 'next/link'

/**
 * PlatformHeader — cabecera de la plataforma central.
 *
 * Diferenciada visualmente del Header del tenant:
 * - Sin CSS custom properties de marca (no usa --color-primary, etc.)
 * - Estética neutra / zinc en lugar de la paleta cálida del tenant
 * - Enlaza a `/`, no a `/negocios/[slug]`
 */
export function PlatformHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Marca de la plataforma */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <span className="w-6 h-6 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <span className="text-white dark:text-zinc-900 text-xs font-bold leading-none">B</span>
            </span>
            <span>Business Starter</span>
          </Link>

          {/* Acción secundaria — placeholder para M9+ */}
          <nav className="flex items-center gap-4 text-sm">
            <span className="text-zinc-400 dark:text-zinc-600 text-xs hidden sm:block">
              Plataforma multi-tenant
            </span>
          </nav>
        </div>
      </div>
    </header>
  )
}
