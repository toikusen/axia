import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';
import { StaticPage } from '../models/static-page.model';

@Injectable({ providedIn: 'root' })
export class StaticPageService {
  getAll(): Observable<StaticPage[]> {
    return from(
      supabase
        .from('static_page')
        .select('*')
        .order('sort_order', { ascending: true })
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as StaticPage[];
    }));
  }

  getBySlug(slug: string): Observable<StaticPage> {
    return from(
      supabase
        .from('static_page')
        .select('*')
        .eq('slug', slug)
        .single()
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as StaticPage;
    }));
  }
}
