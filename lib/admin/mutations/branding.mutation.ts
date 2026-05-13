import { rowToBusinessSettings, type BusinessSettingsRow } from '@/lib/persistence'
import type { SupabaseServerClient, MutationResult } from '@/lib/admin/context'
import type { BusinessSettings, BrandingOverride } from '@/types'

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateBranding(
  supabase: SupabaseServerClient,
  businessId: string,
  branding: BrandingOverride,
): Promise<MutationResult<BusinessSettings>> {
  const { data, error } = await supabase
    .from('businesses')
    .update({ branding: branding as unknown as Record<string, unknown> })
    .eq('id', businessId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudo guardar el branding. Intenta de nuevo.' }
  }

  return { ok: true, data: rowToBusinessSettings(data as BusinessSettingsRow) }
}
