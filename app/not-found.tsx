/**
 * Página 404 global
 *
 * Se muestra cuando no hay ruta que coincida.
 */

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <main className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl font-semibold mb-4">Página no encontrada</p>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          La ruta que buscas no existe.
        </p>

        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Volver a inicio
        </Link>
      </main>
    </div>
  )
}
