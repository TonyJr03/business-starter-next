/**
 * Página 403 global — Acceso denegado
 *
 * Se muestra cuando forbidden() es invocado (usuario autenticado
 * pero sin permisos para el recurso solicitado).
 *
 * Activada por el flag experimental.authInterrupts en next.config.ts.
 */

import Link from 'next/link'

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <main className="text-center max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-4">
          Error 403
        </p>
        <h1 className="text-5xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
          Acceso denegado
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-2">
          Tu cuenta no tiene permisos para acceder a esta sección.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-10">
          Si crees que esto es un error, contacta al administrador de la plataforma.
        </p>

        <Link
          href="/"
          className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity inline-block text-sm font-medium"
        >
          Volver al inicio
        </Link>
      </main>
    </div>
  )
}
