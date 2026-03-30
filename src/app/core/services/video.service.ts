import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';
import { Video } from '../models/video.model';

@Injectable({ providedIn: 'root' })
export class VideoService {
  getAll(): Observable<Video[]> {
    return from(
      supabase
        .from('video')
        .select('*')
        .order('published_at', { ascending: false })
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as Video[];
    }));
  }
}
