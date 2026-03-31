import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';
import { Video } from '../models/video.model';
import { BaseAdminCrudService } from './base-admin-crud.service';
import { VersionService } from './version.service';

@Injectable({ providedIn: 'root' })
export class VideoService extends BaseAdminCrudService<Video> {
  constructor(versionService: VersionService) {
    super('video', versionService);
  }

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

  listAdmin(): Promise<Video[]> {
    return this.listAll('published_at', false);
  }
}
