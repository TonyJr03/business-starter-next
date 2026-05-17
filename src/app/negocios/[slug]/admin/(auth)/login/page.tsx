/**
 * Página de login
 *
 * Ruta: /negocios/[slug]/login
 * Acceso: público (no protegido)
 *
 * Estética admin: fondo zinc-950, card zinc-900, sin Header/Footer.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LoginForm } from './login-form'
import { getAdminContext } from '@/lib/admin'
import { resolveBusinessBySlug } from '@/services'

interface LoginPageProps {
  params: Promise<{ slug: string }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { slug } = await params

  // Solo redirige si ya está autenticado Y es admin de este negocio.
  // Si tiene sesión pero no el rol, deja el form visible para otras credenciales.
  const ctxResult = await getAdminContext(slug)
  if (ctxResult.ok) {
    redirect(`/negocios/${slug}/admin`)
  }

  // resolveBusinessBySlug usa React.cache() — sin query extra si getAdminContext ya la llamó.
  const business = await resolveBusinessBySlug(slug)

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-zinc-100 truncate">
            {business?.name ?? slug}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Panel Admin</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 space-y-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Iniciar sesión</h1>
            <p className="text-sm text-zinc-500 mt-1">Ingresa tus credenciales de administrador.</p>
          </div>

          <LoginForm slug={slug} />
        </div>

        {/* Footer link */}
        <p className="text-center mt-6">
          <Link
            href={`/negocios/${slug}`}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            ← Ver sitio público
          </Link>
        </p>

      </div>
    </div>
  )
}

