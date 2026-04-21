/**
 * Home del tenant
 *
 * Ruta: /negocios/[slug]
 * Acceso: público
 *
 * Muestra: página pública del negocio con catálogo y promociones.
 * M3: Placeholder estructural
 * M4+: Catálogo real, promotions, módulos dinámicos
 */

import Link from 'next/link'

interface TenantHomeProps {
  params: Promise<{ slug: string }>
}

export default async function TenantHome({ params }: TenantHomeProps) {
  const { slug } = await params

  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-semibold rounded-full mb-4">
          PÚBLICO — Accesible a todos
        </span>
        <h1 className="text-4xl font-bold mt-2">Home del Negocio</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">slug: <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{slug}</code></p>
      </div>

      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        M3 — Placeholder. Aquí irá el catálogo, promociones y contenido del negocio (M4+).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <h3 className="font-semibold mb-2">📦 Catálogo</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Productos categorizados</p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <h3 className="font-semibold mb-2">🎉 Promociones</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Ofertas activas</p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <h3 className="font-semibold mb-2">ℹ️ Contacto</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Email, teléfono, ubicación</p>
        </div>
        <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <h3 className="font-semibold mb-2">⏰ Horarios</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Días y horarios de atención</p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Link
          href={`/negocios/${slug}/login`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Admin Login
        </Link>
        <Link
          href="/"
          className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
        >
          ← Volver
        </Link>
      </div>

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Status: Estructura base creada en M3. Catálogo real en M4+. UI final en M5+.
        </p>
      </div>
    </div>
  )
}
