import { VersionAction, VersionedTableName } from '../models/content-version.model';
import { supabase } from '../supabase.client';
import { VersionService } from './version.service';

interface IdentifiableRecord {
  id: string;
}

export abstract class BaseAdminCrudService<T extends IdentifiableRecord> {
  protected constructor(
    private readonly tableName: string,
    private readonly versionService?: VersionService
  ) {}

  protected async listAll(orderColumn: string, ascending: boolean): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order(orderColumn, { ascending });

    if (error) {
      throw error;
    }

    return data as T[];
  }

  async findById(id: string): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as T;
  }

  async create(payload: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(this.prepareWritePayload(payload))
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as T;
  }

  async upsert(payload: Partial<T> & IdentifiableRecord): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .upsert(this.prepareWritePayload(payload))
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as T;
  }

  async update(id: string, payload: Partial<T>): Promise<T> {
    await this.saveSnapshotIfNeeded(id, 'update');

    const { data, error } = await supabase
      .from(this.tableName)
      .update(this.prepareWritePayload(payload, true))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as T;
  }

  async delete(id: string): Promise<void> {
    await this.saveSnapshotIfNeeded(id, 'delete');

    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw error;
    }
  }

  async count(): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return count ?? 0;
  }

  protected prepareWritePayload(payload: Partial<T>, isUpdate = false): Partial<T> {
    const nextPayload = { ...payload } as Record<string, unknown>;

    if (isUpdate) {
      nextPayload['updated_at'] = new Date().toISOString();
    }

    return nextPayload as Partial<T>;
  }

  private async saveSnapshotIfNeeded(id: string, action: VersionAction): Promise<void> {
    if (!this.versionService || !this.isVersionedTable(this.tableName)) {
      return;
    }

    const currentRecord = await this.findById(id);

    await this.versionService.saveSnapshot(
      this.tableName,
      id,
      currentRecord as unknown as Record<string, unknown>,
      action
    );
  }

  private isVersionedTable(tableName: string): tableName is VersionedTableName {
    return [
      'information',
      'schedule',
      'member',
      'video',
      'discography',
      'goods',
      'static_page',
    ].includes(tableName);
  }
}
