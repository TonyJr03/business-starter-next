/**
 * Home pública — plataforma M3 placeholder
 *
 * Ruta: /
 */

export default function PlatformHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <main className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-6">Business Starter Next</h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
          Plataforma multi-tenant en construcción.
        </p>
        <p className="text-lg text-zinc-500 dark:text-zinc-500 mb-12">
          M3 — Estructura base de rutas y middleware. Placeholder mientras se prepara login y UI final.
        </p>

        <div className="flex flex-col gap-4">
          <a
            href="/negocios/cafe-la-esquina"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Ejemplo de Tenant
          </a>
          <a
            href="/negocios/cafe-la-esquina/login"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Login (Placeholder)
          </a>
        </div>
      </main>
    </div>
  )
}
