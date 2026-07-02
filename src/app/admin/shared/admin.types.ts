import { Injector } from '@angular/core';
import { VersionedTableName } from '../../core/models/content-version.model';

export type AdminResourceKey =
  | 'information'
  | 'schedule'
  | 'member'
  | 'video'
  | 'discography'
  | 'goods'
  | 'rules';

export type AdminFieldType =
  | 'text'
  | 'richtext'
  | 'image'
  | 'datetime'
  | 'date'
  | 'select'
  | 'segmented'
  | 'toggle'
  | 'number'
  | 'color'
  | 'tags'
  | 'json';

export interface AdminFieldOption {
  label: string;
  value: string | boolean | number;
}

export interface AdminFormField {
  key: string;
  label: string;
  type: AdminFieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: AdminFieldOption[];
  rows?: number;
  span?: 1 | 2;
  uploadFolder?: string;
  imageHint?: string;
  step?: string;
}

export interface AdminTableColumn {
  header: string;
  key?: string;
  render?: (item: Record<string, unknown>) => string;
}

export interface AdminResourceConfig {
  resourceKey: AdminResourceKey;
  tableName: VersionedTableName;
  title: string;
  singularLabel: string;
  basePath: string;
  columns: AdminTableColumn[];
  fields: AdminFormField[];
  emptyValue: () => Record<string, unknown>;
  loadList: (injector: Injector) => Promise<Record<string, unknown>[]>;
  loadOne: (injector: Injector, id: string) => Promise<Record<string, unknown>>;
  create: (injector: Injector, payload: Record<string, unknown>) => Promise<unknown>;
  update: (injector: Injector, id: string, payload: Record<string, unknown>) => Promise<unknown>;
  delete: (injector: Injector, id: string) => Promise<void>;
  toFormValue: (record: Record<string, unknown>) => Record<string, unknown>;
  fromFormValue: (value: Record<string, unknown>) => Record<string, unknown>;
}
