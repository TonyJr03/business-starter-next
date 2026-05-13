'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { platformDefaults } from '@/config/platform-defaults'
import { getSuperAdminContext } from '@/lib/admin/superadmin-context'
import { updateModules } from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'
import type {
  ModulesOverride,
  PageModuleId,
  PageModuleConfig,
  SectionModuleId,
  SectionModuleConfig,
  FeatureModuleId,
} from '@/types'

// ─── IDs canónicos ────────────────────────────────────────────────────────────

const PAGE_IDS: PageModuleId[] = ['catalog', 'promotions', 'about', 'contact', 'faq', 'gallery', 'blog']
const SECTION_IDS: SectionModuleId[] = ['highlights', 'promotions', 'hours', 'whatsapp_cta', 'location']
const FEATURE_IDS: FeatureModuleId[] = ['cart', 'whatsappOrdering']

// ─── Delta builder ────────────────────────────────────────────────────────────

/**
 * Compara el valor enviado contra el default de plataforma.
 * Devuelve el valor enviado si difiere, o `undefined` si es igual (no incluir en delta).
 * El string vacío puede sobreescribir un default con texto (clearing explícito).
 */
function diffText(submitted: FormDataEntryValue | null, defaultVal: string | undefined): string | undefined {
  const val = String(submitted ?? '').trim()
  const def = defaultVal ?? ''
  return val !== def ? val : undefined
}

function buildModulesOverride(formData: FormData): ModulesOverride {
  const base = platformDefaults.modules
  const result: ModulesOverride = {}

  // ── Page modules ────────────────────────────────────────────────────────────
  for (const id of PAGE_IDS) {
    const def = base.pages[id]
    const delta: Partial<PageModuleConfig> = {}

    const enabled = formData.get(`pages.${id}.enabled`) === 'on'
    if (enabled !== def.enabled) delta.enabled = enabled

    const navLabel = diffText(formData.get(`pages.${id}.navLabel`), def.navLabel)
    if (navLabel !== undefined) delta.navLabel = navLabel

    const title = diffText(formData.get(`pages.${id}.title`), def.title)
    if (title !== undefined) delta.title = title

    const subtitle = diffText(formData.get(`pages.${id}.subtitle`), def.subtitle)
    if (subtitle !== undefined) delta.subtitle = subtitle

    const featuredTitle = diffText(formData.get(`pages.${id}.featuredTitle`), def.featuredTitle)
    if (featuredTitle !== undefined) delta.featuredTitle = featuredTitle

    const emptyMessage = diffText(formData.get(`pages.${id}.emptyMessage`), def.emptyMessage)
    if (emptyMessage !== undefined) delta.emptyMessage = emptyMessage

    if (Object.keys(delta).length > 0) {
      result.pages ??= {}
      result.pages[id] = delta
    }
  }

  // ── Section modules ─────────────────────────────────────────────────────────
  for (const id of SECTION_IDS) {
    const def = base.sections[id]
    const delta: Partial<SectionModuleConfig> = {}

    const enabled = formData.get(`sections.${id}.enabled`) === 'on'
    if (enabled !== def.enabled) delta.enabled = enabled

    const orderRaw = parseInt(String(formData.get(`sections.${id}.order`) ?? ''), 10)
    if (!isNaN(orderRaw) && orderRaw !== def.order) delta.order = orderRaw

    const title = diffText(formData.get(`sections.${id}.title`), def.title)
    if (title !== undefined) delta.title = title

    const subtitle = diffText(formData.get(`sections.${id}.subtitle`), def.subtitle)
    if (subtitle !== undefined) delta.subtitle = subtitle

    const buttonLabel = diffText(formData.get(`sections.${id}.buttonLabel`), def.buttonLabel)
    if (buttonLabel !== undefined) delta.buttonLabel = buttonLabel

    const message = diffText(formData.get(`sections.${id}.message`), def.message)
    if (message !== undefined) delta.message = message

    if (Object.keys(delta).length > 0) {
      result.sections ??= {}
      result.sections[id] = delta
    }
  }

  // ── Feature modules ─────────────────────────────────────────────────────────
  for (const id of FEATURE_IDS) {
    const enabled = formData.get(`features.${id}.enabled`) === 'on'
    if (enabled !== base.features[id].enabled) {
      result.features ??= {}
      result.features[id] = { enabled }
    }
  }

  return result
}

// ─── Action pública ───────────────────────────────────────────────────────────

export async function updateModulesAction(
  businessId: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getSuperAdminContext()
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const modules = buildModulesOverride(formData)
  const result = await updateModules(ctxResult.ctx.supabase, businessId, modules)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath(`/superadmin/businesses/${businessId}/modules`, 'page')
  redirect(`/superadmin/businesses/${businessId}/modules?saved=1`)
}
