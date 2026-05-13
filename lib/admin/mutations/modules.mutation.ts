import { rowToBusinessSettings, type BusinessSettingsRow } from '@/lib/persistence'
import type { SupabaseServerClient, MutationResult } from '@/lib/admin/context'
import type { BusinessSettings, ModulesOverride } from '@/types'

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateModules(
  supabase: SupabaseServerClient,
  businessId: string,
  modules: ModulesOverride,
): Promise<MutationResult<BusinessSettings>> {
  const { data, error } = await supabase
    .from('businesses')
    .update({ modules: modules as unknown as Record<string, unknown> })
    .eq('id', businessId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: 'No se pudieron guardar los módulos. Intenta de nuevo.' }
  }

  return { ok: true, data: rowToBusinessSettings(data as BusinessSettingsRow) }
}
