import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { VersionService } from '../../core/services/version.service';
import { formatDateLabel } from '../shared/admin.utils';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <section class="space-y-6">
      <header>
        <p class="text-xs uppercase tracking-[0.3em] text-[#c8a882]">Audit</p>
        <h1 class="mt-2 text-3xl font-semibold text-white">Audit Log</h1>
      </header>

      @if (errorMessage()) {
        <div class="admin-panel px-6 py-4 text-sm text-red-300">{{ errorMessage() }}</div>
      }

      <div class="admin-panel overflow-hidden">
        <p-table [value]="entries()" [loading]="loading()" styleClass="admin-data-table" dataKey="id">
          <ng-template pTemplate="header">
            <tr>
              <th>時間</th>
              <th>資料表</th>
              <th>動作</th>
              <th>操作者</th>
              <th>Record ID</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td>{{ formatLabel(item.changed_at) }}</td>
              <td>{{ item.table_name }}</td>
              <td>{{ item.action }}</td>
              <td>{{ item.changed_by_email || item.changed_by || '未知使用者' }}</td>
              <td>{{ item.record_id }}</td>
            </tr>
          </ng-template>
        </p-table>
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
      this.errorMessage.set(error instanceof Error ? error.message : 'Audit Log 載入失敗。');
    } finally {
      this.loading.set(false);
    }
  }

  protected formatLabel(value: string): string {
    return formatDateLabel(value);
  }
}

function awaitedVersionHistory() {
  return [] as Awaited<ReturnType<VersionService['getRecent']>>;
}
