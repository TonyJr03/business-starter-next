/**
 * Página de login
 *
 * Ruta: /negocios/[slug]/login
 * Acceso: público (no protegido)
 *
 * Muestra: formulario de autenticación para acceder al admin.
 * M4: Integración real con Supabase Auth via LoginForm (Client Component)
 */

import Link from 'next/link'
import { LoginForm } from './login-form'

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
            <h1 className="text-3xl font-bold mb-2">Acceso al Admin</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Tenant: <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{slug}</code>
            </p>
          </div>

          <LoginForm slug={slug} />

          <div className="flex flex-col gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-6">
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
  )
}
