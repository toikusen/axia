import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';
import { Member } from '../models/member.model';

@Injectable({ providedIn: 'root' })
export class MemberService {
  getAll(): Observable<Member[]> {
    return from(
      supabase
        .from('member')
        .select('*')
        .order('sort_order', { ascending: true })
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as Member[];
    }));
  }

  getById(id: string): Observable<Member> {
    return from(
      supabase
        .from('member')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as Member;
    }));
  }
}
