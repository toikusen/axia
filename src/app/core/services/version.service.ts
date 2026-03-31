import { Injectable, Injector } from '@angular/core';
import { ContentVersion, VersionAction, VersionedTableName } from '../models/content-version.model';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';
import { DiscographyService } from './discography.service';
import { GoodsService } from './goods.service';
import { InformationService } from './information.service';
import { MemberService } from './member.service';
import { ScheduleService } from './schedule.service';
import { StaticPageService } from './static-page.service';
import { VideoService } from './video.service';

interface VersionBridge {
  upsert(payload: { id: string } & Record<string, unknown>): Promise<unknown>;
}

@Injectable({ providedIn: 'root' })
export class VersionService {
  constructor(
    private readonly authService: AuthService,
    private readonly injector: Injector
  ) {}

  async saveSnapshot(
    tableName: VersionedTableName,
    recordId: string,
    data: Record<string, unknown>,
    action: VersionAction
  ): Promise<void> {
    const session = await this.authService.getSession();
    const currentUser = this.authService.currentUser() ?? session?.user ?? null;

    const { error } = await supabase.from('content_versions').insert({
      table_name: tableName,
      record_id: recordId,
      version_data: data,
      changed_by: currentUser?.id ?? null,
      changed_by_email: currentUser?.email ?? null,
      action,
    });

    if (error) {
      throw error;
    }
  }

  async getHistory(tableName: VersionedTableName, recordId: string): Promise<ContentVersion[]> {
    const { data, error } = await supabase
      .from('content_versions')
      .select('*')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('changed_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as ContentVersion[];
  }

  async getRecent(limit = 10): Promise<ContentVersion[]> {
    const { data, error } = await supabase
      .from('content_versions')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data as ContentVersion[];
  }

  async revert(version: ContentVersion): Promise<void> {
    const bridge = this.getBridge(version.table_name);
    await bridge.upsert(version.version_data as { id: string } & Record<string, unknown>);
  }

  private getBridge(tableName: VersionedTableName): VersionBridge {
    switch (tableName) {
      case 'information':
        return this.injector.get(InformationService);
      case 'schedule':
        return this.injector.get(ScheduleService);
      case 'member':
        return this.injector.get(MemberService);
      case 'video':
        return this.injector.get(VideoService);
      case 'discography':
        return this.injector.get(DiscographyService);
      case 'goods':
        return this.injector.get(GoodsService);
      case 'static_page':
        return this.injector.get(StaticPageService);
    }
  }
}
