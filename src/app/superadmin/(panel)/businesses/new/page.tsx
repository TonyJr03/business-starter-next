import { forbidden } from 'next/navigation'
import { getSuperAdminContext } from '@/lib/admin'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { BusinessCreateForm } from './BusinessCreateForm'

// ─── Página ────────────────────────────────────────────────────────────────

export default async function NewBusinessPage() {
  const ctxResult = await getSuperAdminContext()
  if (!ctxResult.ok) forbidden()

  return (
    <div className="space-y-6 max-w-xl">
      <AdminPageHeader
        title="Nuevo negocio"
        description="Registra un nuevo tenant en la plataforma."
      />
      <BusinessCreateForm />
    </div>
  )
}

