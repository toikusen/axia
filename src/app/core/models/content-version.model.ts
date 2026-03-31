export type VersionAction = 'update' | 'delete';

export type VersionedTableName =
  | 'information'
  | 'schedule'
  | 'member'
  | 'video'
  | 'discography'
  | 'goods'
  | 'static_page';

export interface ContentVersion {
  id: string;
  table_name: VersionedTableName;
  record_id: string;
  version_data: Record<string, unknown>;
  changed_by: string | null;
  changed_by_email: string | null;
  changed_at: string;
  action: VersionAction;
}
