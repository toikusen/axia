import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';
import { Goods } from '../models/goods.model';
import { BaseAdminCrudService } from './base-admin-crud.service';
import { VersionService } from './version.service';

@Injectable({ providedIn: 'root' })
export class GoodsService extends BaseAdminCrudService<Goods> {
  constructor(versionService: VersionService) {
    super('goods', versionService);
  }

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

  listAdmin(): Promise<Goods[]> {
    return this.listAll('sort_order', true);
  }
}
