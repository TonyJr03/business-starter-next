/**
 * Página de login
 *
 * Ruta: /negocios/[slug]/login
 * Acceso: público (no protegido)
 *
 * Muestra: formulario de autenticación para acceder al admin.
 * M3: Placeholder — form deshabilitado, no valida
 * M4: Integración real con Supabase Auth
 */

import Link from 'next/link'

interface LoginPageProps {
  params: Promise<{ slug: string }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { slug } = await params

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md">
        <div className="space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800">
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 text-xs font-semibold rounded-full mb-3">
              PÚBLICO
            </span>
            <h1 className="text-3xl font-bold mb-2 mt-2">Acceso al Admin</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Tenant: <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{slug}</code>
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs text-yellow-900 dark:text-yellow-100">
              ⚠️ Formulario deshabilitado en M3 (placeholder).
              <br />
              Lógica de autenticación real en M4.
            </p>
          </div>

          {/* Form placeholder */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="admin@negocio.com"
                disabled
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                disabled
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Ingresar (M4)
            </button>
          </form>

          <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mb-2">Intentos de acceso:</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                En M4 usaremos Supabase Auth + servidor de autenticación.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/negocios/${slug}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline text-center"
              >
                Ver home público del negocio
              </Link>
              <Link
                href="/"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline text-center"
              >
                ← Volver a inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
