import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.82;

/**
 * Downscale and re-encode an image before upload so the public site never
 * serves multi-MB originals. GIF/SVG pass through untouched (animation/vector);
 * PNG keeps its format to preserve transparency; everything else becomes JPEG.
 */
export async function compressImage(file: File): Promise<{ blob: Blob; extension: string }> {
  const passThrough = { blob: file as Blob, extension: file.name.split('.').pop()?.toLowerCase() ?? 'jpg' };

  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return passThrough;
  }

  const bitmap = await createImageBitmap(file);
  const needsResize = bitmap.width > MAX_WIDTH;
  const keepPng = file.type === 'image/png';

  // Small enough and already reasonably encoded — keep the original bytes.
  if (!needsResize && (keepPng || file.size <= 400 * 1024)) {
    bitmap.close();
    return passThrough;
  }

  const scale = needsResize ? MAX_WIDTH / bitmap.width : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const type = keepPng ? 'image/png' : 'image/jpeg';
  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, type, keepPng ? undefined : JPEG_QUALITY)
  );

  if (!blob) return passThrough;
  return { blob, extension: keepPng ? 'png' : 'jpg' };
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  async upload(file: File, folder: string): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('僅支援圖片檔案。');
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error('圖片大小不可超過 5MB。');
    }

    const { blob, extension } = await compressImage(file);
    const objectPath = `${folder}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from('axia-media')
      .upload(objectPath, blob, {
        contentType: blob.type || file.type,
        upsert: false,
        cacheControl: '31536000',
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from('axia-media').getPublicUrl(objectPath);
    return data.publicUrl;
  }
}
