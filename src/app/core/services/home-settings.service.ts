import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';

export interface HomeSettings {
  id: string;
  hero_image_url: string | null;
  sns_links: Record<string, string>;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class HomeSettingsService {
  get(): Observable<HomeSettings> {
    return from(
      supabase.from('home_settings').select('*').single()
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as HomeSettings;
    }));
  }
}
