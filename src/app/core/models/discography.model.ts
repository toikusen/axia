export interface Discography {
  id: string;
  title: string;
  cover_image_url: string | null;
  release_date: string;
  type: 'single' | 'ep' | 'album';
  streaming_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const DISCOGRAPHY_TYPE_LABELS: Record<Discography['type'], string> = {
  single: 'Single',
  ep: 'EP',
  album: 'Album',
};
