export interface Member {
  id: string;
  name: string;
  photo_url: string | null;
  bio: string;
  color_hex: string;
  sns_links: Record<string, string>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
