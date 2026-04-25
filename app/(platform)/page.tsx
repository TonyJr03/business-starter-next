/**
 * Página raíz de la plataforma — `/`
 *
 * Directorio público de negocios activos.
 * Server Component: los datos se leen en servidor, sin estado en cliente.
 *
 * Layout aplicado: app/(platform)/layout.tsx (PlatformHeader + PlatformFooter)
 */

import type { Metadata } from 'next'
import { listActiveBusinesses } from '@/lib/tenant'
import { BusinessCard } from '@/components/platform/BusinessCard'

export const metadata: Metadata = {
  title: 'Business Starter — Directorio de negocios',
  description: 'Explora los negocios disponibles en la plataforma.',
}

export default async function PlatformDirectoryPage() {
  const businesses = await listActiveBusinesses()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

      {/* Encabezado introductorio */}
      <header className="mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Directorio de negocios
        </h1>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
          Explora los negocios disponibles en la plataforma. Cada sitio tiene su
          propio catálogo, horarios y formas de contacto.
        </p>
      </header>

      {businesses.length > 0 ? (
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          role="list"
          aria-label="Listado de negocios"
        >
          {businesses.map((business) => (
            <li key={business.id}>
              <BusinessCard business={business} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyDirectory />
      )}
    </div>
  )
}

function EmptyDirectory() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-6 h-6 text-zinc-400"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016 2.993 2.993 0 0 0 2.25-1.016 3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        No hay negocios disponibles
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
        Aún no hay negocios publicados en la plataforma. Vuelve pronto.
      </p>
    </div>
  )
}
