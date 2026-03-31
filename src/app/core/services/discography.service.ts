import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';
import { Discography } from '../models/discography.model';
import { BaseAdminCrudService } from './base-admin-crud.service';
import { VersionService } from './version.service';

@Injectable({ providedIn: 'root' })
export class DiscographyService extends BaseAdminCrudService<Discography> {
  constructor(versionService: VersionService) {
    super('discography', versionService);
  }

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

  listAdmin(): Promise<Discography[]> {
    return this.listAll('release_date', false);
  }
}
