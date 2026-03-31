import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

@Injectable({ providedIn: 'root' })
export class StorageService {
  async upload(file: File, folder: string): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('僅支援圖片檔案。');
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error('圖片大小不可超過 5MB。');
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const objectPath = `${folder}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from('axia-media')
      .upload(objectPath, file, { contentType: file.type, upsert: false });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from('axia-media').getPublicUrl(objectPath);
    return data.publicUrl;
  }
}
