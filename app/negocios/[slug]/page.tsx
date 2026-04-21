/**
 * Home del tenant
 *
 * Ruta: /negocios/[slug]
 * Placeholder para la página pública del negocio.
 */

export default async function TenantHome() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Home del Negocio</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        M3 — Placeholder. Aquí irá el catálogo, promociones y contenido del negocio.
      </p>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Navegación</h2>
        <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300">
          <li>Catálogo de productos</li>
          <li>Promociones activas</li>
          <li>Información de contacto</li>
          <li>Horarios y ubicación</li>
        </ul>
      </div>

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Status: Estructura base creada en M3. UI final en M5+.
        </p>
      </div>
    </div>
  )
}
