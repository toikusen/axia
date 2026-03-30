import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';
import { Schedule } from '../models/schedule.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  getAll(): Observable<Schedule[]> {
    return from(
      supabase
        .from('schedule')
        .select('*')
        .order('event_date', { ascending: true })
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as Schedule[];
    }));
  }

  getUpcoming(limit: number): Observable<Schedule[]> {
    const now = new Date().toISOString();
    return from(
      supabase
        .from('schedule')
        .select('*')
        .gte('event_date', now)
        .order('event_date', { ascending: true })
        .limit(limit)
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as Schedule[];
    }));
  }
}
