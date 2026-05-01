import type { Promotion, PromotionStatus, PromotionRule } from '@/types';

export interface PromotionRow {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  status: PromotionStatus;
  discount_label: string | null;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  rules: PromotionRule[] | null;
  sort_order: number;
}

export type PromotionInsertRow = Omit<PromotionRow, 'id' | 'business_id'>;

export function rowToPromotion(row: PromotionRow): Promotion {
  return {
    id:            row.id,
    title:         row.title,
    description:   row.description ?? '',
    status:        row.status,
    discountLabel: row.discount_label ?? undefined,
    imageUrl:      row.image_url ?? undefined,
    startsAt:      row.starts_at ?? undefined,
    endsAt:        row.ends_at ?? undefined,
    rules:         row.rules ?? undefined,
    sortOrder:     row.sort_order,
  };
}
