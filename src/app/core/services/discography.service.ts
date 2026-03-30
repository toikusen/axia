import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';
import { Discography } from '../models/discography.model';

@Injectable({ providedIn: 'root' })
export class DiscographyService {
  getAll(): Observable<Discography[]> {
    return from(
      supabase
        .from('discography')
        .select('*')
        .order('release_date', { ascending: false })
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as Discography[];
    }));
  }
}
