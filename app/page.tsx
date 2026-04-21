/**
 * Home pública — plataforma M3 placeholder
 *
 * Ruta: /
 * Acceso: público
 *
 * Muestra: punto de entrada a la plataforma multi-tenant
 */

import Link from 'next/link'

export default function PlatformHome() {
  const exampleSlug = 'cafe-la-esquina'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <main className="text-center max-w-3xl">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold rounded-full mb-4">
            M3 — Estructura Base
          </span>
        </div>

        <h1 className="text-5xl font-bold mb-4">Business Starter Next</h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
          Plataforma multi-tenant con resolución de tenants por path.
        </p>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-12 leading-relaxed">
          Esta es la página pública de la plataforma. Acceso público a explorar tenants, login y pagos.
          <br />
          <span className="text-sm text-zinc-400 dark:text-zinc-600 mt-2 block">M4 agregará login real. M5 completará UI definitiva.</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href={`/negocios/${exampleSlug}`}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Ver Tenant: {exampleSlug}
          </Link>
          <Link
            href={`/negocios/${exampleSlug}/login`}
            className="px-6 py-4 bg-zinc-700 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
          >
            Login de Admin
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-sm text-left">
          <p className="font-semibold mb-3 text-zinc-900 dark:text-white">🔍 Rutas disponibles en M3:</p>
          <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
            <li><code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">/{exampleSlug}</code> → Home pública del tenant</li>
            <li><code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">/{exampleSlug}/login</code> → Form placeholder (public)</li>
            <li><code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">/{exampleSlug}/admin</code> → Dashboard (con sesión → redirige a login)</li>
            <li><code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">/inexistente</code> → Devuelve 404</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
