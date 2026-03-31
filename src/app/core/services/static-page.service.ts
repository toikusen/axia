import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from '../supabase.client';
import { StaticPage } from '../models/static-page.model';
import { BaseAdminCrudService } from './base-admin-crud.service';
import { VersionService } from './version.service';

@Injectable({ providedIn: 'root' })
export class StaticPageService extends BaseAdminCrudService<StaticPage> {
  constructor(versionService: VersionService) {
    super('static_page', versionService);
  }

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

  listAdmin(): Promise<StaticPage[]> {
    return this.listAll('sort_order', true);
  }

  async getOrCreateContactPage(): Promise<StaticPage> {
    const { data, error } = await supabase
      .from('static_page')
      .select('*')
      .eq('slug', 'contact-info')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data as StaticPage;
    }

    return this.create({
      slug: 'contact-info',
      title: '聯絡資訊',
      content_rich_text: '<p>請在此編輯聯絡資訊內容。</p>',
      sort_order: 99,
    });
  }
}
