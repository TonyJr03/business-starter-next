import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { BusinessCreateForm } from './BusinessCreateForm'

// ─── Página ──────────────────────────────────────────────────────────────────

export default function NewBusinessPage() {
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

