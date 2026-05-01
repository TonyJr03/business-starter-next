import type { FaqItem } from '@/types';

export interface FaqItemRow {
  id: string;
  business_id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function rowToFaqItem(row: FaqItemRow): FaqItem {
  return {
    id:       row.id,
    question: row.question,
    answer:   row.answer,
    category: row.category ?? undefined,
  };
}
