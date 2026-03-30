import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';
import { Goods } from '../models/goods.model';

@Injectable({ providedIn: 'root' })
export class GoodsService {
  getAll(): Observable<Goods[]> {
    return from(
      supabase
        .from('goods')
        .select('*')
        .order('sort_order', { ascending: true })
    ).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as Goods[];
    }));
  }
}
