import type { BrandingOverride, BusinessSocial, DayHours, BusinessContact, BusinessLocation, BusinessLogo } from '@/types';
import type { BusinessSettings, BusinessDirectoryItem } from '@/types';
import type { ModulesOverride } from '@/types';

// ─── Settings row ─────────────────────────────────────────────────────────────

export interface BusinessSettingsRow {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  contact: BusinessContact | null;
  location: BusinessLocation | null;
  logo: BusinessLogo | null;
  social: BusinessSocial | null;
  hours: DayHours[] | null;
  is_active: boolean;
  branding: BrandingOverride | null;
  modules: ModulesOverride | null;
  created_at: string;
  updated_at: string;
}

export function rowToBusinessSettings(row: BusinessSettingsRow): BusinessSettings {
  return {
    id:               row.id,
    slug:             row.slug,
    name:             row.name,
    shortDescription: row.short_description ?? undefined,
    contact:          row.contact   ?? undefined,
    location:         row.location  ?? undefined,
    logo:             row.logo      ?? undefined,
    social:           row.social    ?? undefined,
    hours:            row.hours     ?? undefined,
    isActive:         row.is_active,
    branding:         row.branding  ?? undefined,
    modules:          row.modules   ?? undefined,
  };
}

// ─── Directory row ────────────────────────────────────────────────────────────

export interface BusinessDirectoryRow {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  location: { city?: string } | null;
}

export function rowToBusinessDirectoryItem(row: BusinessDirectoryRow): BusinessDirectoryItem {
  return {
    id:               row.id,
    slug:             row.slug,
    name:             row.name,
    shortDescription: row.short_description ?? undefined,
    city:             row.location?.city ?? undefined,
  };
}
