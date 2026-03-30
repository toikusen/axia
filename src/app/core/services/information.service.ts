import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';
import { Information } from '../models/information.model';

@Injectable({ providedIn: 'root' })
export class InformationService {
  getAll(): Observable<Information[]> {
    return from(
      supabase
        .from('information')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as Information[];
    }));
  }

  getLatest(limit: number): Observable<Information[]> {
    return from(
      supabase
        .from('information')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit)
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as Information[];
    }));
  }

  getById(id: string): Observable<Information> {
    return from(
      supabase
        .from('information')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single()
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as Information;
    }));
  }
}
