import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { VersionService } from '../../core/services/version.service';
import { formatDateLabel, translateAction, translateTableName } from '../shared/admin.utils';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <section class="space-y-4">
      @if (errorMessage()) {
        <div class="admin-panel px-6 py-4 text-sm text-red-300" role="alert" aria-live="assertive">{{ errorMessage() }}</div>
      }

      <div class="admin-panel overflow-x-auto hidden lg:block">
        <p-table
          [value]="entries()"
          [loading]="loading()"
          styleClass="admin-data-table"
          dataKey="id"
          [paginator]="true"
          [rows]="25"
          [rowsPerPageOptions]="[25, 50, 100]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="共 {totalRecords} 筆，第 {first}–{last} 筆"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>時間</th>
              <th>資料表</th>
              <th>動作</th>
              <th>操作者</th>
              <th>記錄 ID</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td>{{ formatLabel(item.changed_at) }}</td>
              <td>{{ translateTableName(item.table_name) }}</td>
              <td>{{ translateAction(item.action) }}</td>
              <td>{{ item.changed_by_email || item.changed_by || '未知使用者' }}</td>
              <td>
                <button type="button" class="inline-flex items-center gap-1.5 font-mono text-xs text-white/55 hover:text-accent"
                        [title]="item.record_id" (click)="copyId(item.record_id)">
                  <i class="pi pi-copy text-xs"></i>{{ item.record_id.slice(0, 8) }}…
                </button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- 窄畫面：卡片堆疊 -->
      <div class="space-y-3 lg:hidden">
        @for (item of entries(); track item.id) {
          <div class="admin-panel p-4 space-y-2">
            <div class="flex items-start justify-between gap-3">
              <span class="shrink-0 text-xs text-white/45">時間</span>
              <span class="text-right text-sm text-white">{{ formatLabel(item.changed_at) }}</span>
            </div>
            <div class="flex items-start justify-between gap-3">
              <span class="shrink-0 text-xs text-white/45">資料表</span>
              <span class="text-right text-sm text-white">{{ translateTableName(item.table_name) }}</span>
            </div>
            <div class="flex items-start justify-between gap-3">
              <span class="shrink-0 text-xs text-white/45">動作</span>
              <span class="text-right text-sm text-white">{{ translateAction(item.action) }}</span>
            </div>
            <div class="flex items-start justify-between gap-3">
              <span class="shrink-0 text-xs text-white/45">操作者</span>
              <span class="text-right text-sm text-white">{{ item.changed_by_email || item.changed_by || '未知使用者' }}</span>
            </div>
            <div class="flex items-start justify-between gap-3">
              <span class="shrink-0 text-xs text-white/45">記錄 ID</span>
              <button type="button" class="inline-flex items-center gap-1.5 font-mono text-xs text-white/55 hover:text-accent"
                      [title]="item.record_id" (click)="copyId(item.record_id)">
                <i class="pi pi-copy text-xs"></i>{{ item.record_id.slice(0, 8) }}…
              </button>
            </div>
          </div>
        } @empty {
          <div class="admin-panel px-5 py-12 text-center text-sm text-white/55">目前沒有操作紀錄。</div>
        }
      </div>
    </section>
  `,
})
export class AuditLogComponent implements OnInit {
  private readonly versionService = inject(VersionService);

  protected readonly entries = signal(awaitedVersionHistory());
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      this.entries.set(await this.versionService.getRecent(100));
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '操作紀錄載入失敗。');
    } finally {
      this.loading.set(false);
    }
  }

  protected formatLabel(value: string): string {
    return formatDateLabel(value);
  }

  protected translateTableName(name: string): string {
    return translateTableName(name);
  }

  protected translateAction(action: string): string {
    return translateAction(action);
  }

  protected async copyId(id: string): Promise<void> {
    try { await navigator.clipboard.writeText(id); } catch { /* no-op */ }
  }
}

function awaitedVersionHistory() {
  return [] as Awaited<ReturnType<VersionService['getRecent']>>;
}
