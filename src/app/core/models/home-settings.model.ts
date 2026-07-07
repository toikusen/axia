export interface HomeSettings {
  id: string;
  hero_image_url: string | null;
  sns_links: Record<string, string>;
  nav_visibility: Record<string, boolean>;
  updated_at: string;
}
