'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { platformDefaults } from '@/config/platform-defaults'
import { getSuperAdminContext } from '@/lib/admin'
import { updateBranding } from '@/lib/admin'
import type { AdminActionState } from '@/lib/admin'
import type { BrandingOverride, BrandingColors, BrandingTypography } from '@/types'

// ─── Color fields ─────────────────────────────────────────────────────────────

const COLOR_KEYS: (keyof BrandingColors)[] = [
  'primary',
  'secondary',
  'accent',
  'footerBg',
  'footerText',
  'footerTextMuted',
  'footerBorder',
]

// ─── Delta builder ────────────────────────────────────────────────────────────

function buildBrandingOverride(formData: FormData): BrandingOverride {
  const base = platformDefaults.branding
  const result: BrandingOverride = {}

  // themeKey
  const themeKey = String(formData.get('themeKey') ?? '').trim()
  if (themeKey && themeKey !== base.themeKey) {
    result.themeKey = themeKey
  }

  // colors — solo guardar los que difieren del default
  const colorsDelta: Partial<BrandingColors> = {}
  for (const key of COLOR_KEYS) {
    const val = String(formData.get(`colors.${key}`) ?? '').trim()
    if (val && val !== base.colors[key]) {
      colorsDelta[key] = val
    }
  }
  if (Object.keys(colorsDelta).length > 0) {
    result.colors = colorsDelta
  }

  // typography — solo guardar los que difieren del default
  const typoDelta: Partial<BrandingTypography> = {}
  const heading = String(formData.get('typography.heading') ?? '').trim()
  if (heading && heading !== base.typography.heading) {
    typoDelta.heading = heading
  }
  const body = String(formData.get('typography.body') ?? '').trim()
  if (body && body !== base.typography.body) {
    typoDelta.body = body
  }
  if (Object.keys(typoDelta).length > 0) {
    result.typography = typoDelta
  }

  return result
}

// ─── Action pública ───────────────────────────────────────────────────────────

export async function updateBrandingAction(
  businessId: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctxResult = await getSuperAdminContext()
  if (!ctxResult.ok) return { ok: false, error: ctxResult.error }

  const branding = buildBrandingOverride(formData)
  const result = await updateBranding(ctxResult.ctx.supabase, businessId, branding)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath(`/superadmin/businesses/${businessId}/branding`, 'page')
  redirect(`/superadmin/businesses/${businessId}/branding?saved=1`)
}
