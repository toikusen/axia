import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ContentVersion, VersionedTableName } from '../../../core/models/content-version.model';
import { VersionService } from '../../../core/services/version.service';
import { formatDateLabel } from '../admin.utils';

@Component({
  selector: 'app-version-history',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, DividerModule, TagModule],
  template: `
    <p-dialog
      [modal]="true"
      [draggable]="false"
      [style]="{ width: 'min(960px, 92vw)' }"
      [visible]="visible"
      (visibleChange)="visibleChange.emit($event)"
      header="版本歷史"
    >
      <div class="space-y-4">
        @if (loading()) {
          <p class="text-sm text-white/60">版本資料載入中…</p>
        } @else if (versions().length === 0) {
          <p class="text-sm text-white/60">目前沒有版本快照。</p>
        } @else {
          @for (version of versions(); track version.id) {
            <div class="admin-panel p-4">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <p-tag [severity]="version.action === 'delete' ? 'danger' : 'info'">
                      {{ version.action }}
                    </p-tag>
                    <span class="text-sm text-white/70">{{ formatLabel(version.changed_at) }}</span>
                  </div>
                  <p class="text-sm text-white/80">
                    {{ version.changed_by_email || version.changed_by || '未知使用者' }}
                  </p>
                </div>

                <button
                  pButton
                  type="button"
                  severity="secondary"
                  label="Revert"
                  icon="pi pi-history"
                  [disabled]="revertingVersionId() === version.id"
                  (click)="revertVersion(version)"
                ></button>
              </div>

              <p-divider></p-divider>
              <pre class="overflow-x-auto rounded-2xl bg-black/30 p-4 text-xs text-white/70">{{
                toJson(version.version_data)
              }}</pre>
            </div>
          }
        }

        @if (errorMessage()) {
          <p class="text-sm text-red-300">{{ errorMessage() }}</p>
        }
      </div>
    </p-dialog>
  `,
})
export class VersionHistoryComponent implements OnChanges {
  private readonly versionService = inject(VersionService);

  @Input({ required: true }) visible = false;
  @Input() tableName: VersionedTableName | null = null;
  @Input() recordId: string | null = null;
  @Output() readonly visibleChange = new EventEmitter<boolean>();
  @Output() readonly reverted = new EventEmitter<void>();

  protected readonly versions = signal<ContentVersion[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly revertingVersionId = signal('');

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (
      (changes['visible'] || changes['tableName'] || changes['recordId']) &&
      this.visible &&
      this.tableName &&
      this.recordId
    ) {
      await this.loadHistory();
    }
  }

  protected formatLabel(value: string): string {
    return formatDateLabel(value);
  }

  protected toJson(value: Record<string, unknown>): string {
    return JSON.stringify(value, null, 2);
  }

  protected async revertVersion(version: ContentVersion): Promise<void> {
    if (!confirm('確定要將這筆資料還原到此版本嗎？')) {
      return;
    }

    this.errorMessage.set('');
    this.revertingVersionId.set(version.id);

    try {
      await this.versionService.revert(version);
      this.reverted.emit();
      this.visibleChange.emit(false);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '還原失敗。');
    } finally {
      this.revertingVersionId.set('');
    }
  }

  private async loadHistory(): Promise<void> {
    if (!this.tableName || !this.recordId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      this.versions.set(await this.versionService.getHistory(this.tableName, this.recordId));
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '版本歷史載入失敗。');
    } finally {
      this.loading.set(false);
    }
  }
}
