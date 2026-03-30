export interface Information {
  id: string;
  title: string;
  content_rich_text: string;
  cover_image_url: string | null;
  tags: string[];
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
