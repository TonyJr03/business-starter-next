import type { AboutContent, ContentFeature } from '@/types';

export interface AboutRow {
  id: string;
  business_id: string;
  story: string[];
  mission: string | null;
  differentiators: ContentFeature[];
  team_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export function rowToAboutContent(row: AboutRow): AboutContent {
  return {
    id:              row.id,
    story:           row.story,
    mission:         row.mission ?? undefined,
    differentiators: row.differentiators,
    teamImageUrl:    row.team_image_url ?? undefined,
  };
}
