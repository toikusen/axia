import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HomeSettings } from '../models/home-settings.model';
import { supabase } from '../supabase.client';

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

  async getAdmin(): Promise<HomeSettings> {
    const { data, error } = await supabase.from('home_settings').select('*').single();

    if (error) {
      throw error;
    }

    return data as HomeSettings;
  }

  async update(id: string, payload: Partial<HomeSettings>): Promise<HomeSettings> {
    const { data, error } = await supabase
      .from('home_settings')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as HomeSettings;
  }
}
