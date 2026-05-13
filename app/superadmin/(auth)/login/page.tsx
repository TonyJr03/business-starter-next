/**
 * Login exclusivo del área superadmin.
 *
 * Página independiente del login de tenants (/negocios/[slug]/admin/login).
 * El proxy redirige aquí cuando no hay sesión en /superadmin/*.
 */

import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { SuperAdminLoginForm } from './login-form'

export default async function SuperAdminLoginPage() {
  // Si ya tiene sesión, el layout del área protegida verificará el rol.
  if (await isAuthenticated()) {
    redirect('/superadmin')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Plataforma</p>
          <h1 className="text-2xl font-bold text-zinc-100">Panel Superadmin</h1>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Iniciar sesión</h2>
            <p className="text-sm text-zinc-500 mt-1">Acceso restringido a administradores de plataforma.</p>
          </div>
          <SuperAdminLoginForm />
        </div>

      </div>
    </div>
  )
}
