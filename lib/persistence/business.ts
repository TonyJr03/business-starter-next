import type { BusinessSocial, DayHours } from '@/types';
import type { BusinessSettings, BusinessDirectoryItem } from '@/types';

// ─── Settings row ─────────────────────────────────────────────────────────────

export interface BusinessSettingsRow {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  social: BusinessSocial | null;
  hours: DayHours[] | null;
}

export type BusinessSettingsInsertRow = Omit<BusinessSettingsRow, 'id'>;

export function rowToBusinessSettings(row: BusinessSettingsRow): BusinessSettings {
  return {
    id:               row.id,
    slug:             row.slug,
    name:             row.name,
    shortDescription: row.short_description ?? undefined,
    whatsapp:         row.whatsapp ?? undefined,
    phone:            row.phone ?? undefined,
    email:            row.email ?? undefined,
    address:          row.address ?? undefined,
    city:             row.city ?? undefined,
    country:          row.country ?? undefined,
    social:           row.social ?? undefined,
    hours:            row.hours ?? undefined,
  };
}

// ─── Directory row ────────────────────────────────────────────────────────────

export interface BusinessDirectoryRow {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  city: string | null;
}

export function rowToBusinessDirectoryItem(row: BusinessDirectoryRow): BusinessDirectoryItem {
  return {
    id:               row.id,
    slug:             row.slug,
    name:             row.name,
    shortDescription: row.short_description ?? undefined,
    city:             row.city ?? undefined,
  };
}
