export interface Video {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  description: string | null;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export function getYoutubeThumbnail(youtubeUrl: string): string {
  const match = youtubeUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  const videoId = match?.[1] ?? '';
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function getYoutubeEmbedUrl(youtubeUrl: string): string {
  const match = youtubeUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  const videoId = match?.[1] ?? '';
  return `https://www.youtube.com/embed/${videoId}`;
}
