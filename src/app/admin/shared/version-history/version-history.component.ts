import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';
import { ContentVersion, VersionedTableName } from '../../../core/models/content-version.model';
import { VersionService } from '../../../core/services/version.service';
import { formatDateLabel } from '../admin.utils';

@Component({
  selector: 'app-version-history',
  standalone: true,
  imports: [CommonModule, ButtonModule, ConfirmDialogModule, DialogModule, DividerModule, TagModule],
  providers: [ConfirmationService],
  template: `
    <p-dialog
      [modal]="true"
      [draggable]="false"
      [style]="{ width: 'min(960px, 92vw)' }"
      [visible]="visible"
      (visibleChange)="visibleChange.emit($event)"
      header="版本歷史"
    >
      <p-confirmdialog></p-confirmdialog>
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
              <div class="overflow-x-auto rounded-xl bg-black/25 text-xs">
                <table class="w-full">
                  <tbody>
                    @for (entry of toEntries(version.version_data); track entry.key) {
                      <tr class="border-b border-white/5 last:border-0">
                        <td class="w-40 shrink-0 px-4 py-2 font-mono text-white/40">{{ entry.key }}</td>
                        <td class="break-all px-4 py-2 text-white/75">{{ entry.value }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
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
  private readonly confirmationService = inject(ConfirmationService);

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

  protected toEntries(value: Record<string, unknown>): { key: string; value: string }[] {
    return Object.entries(value).map(([k, v]) => ({
      key: k,
      value: v === null || v === undefined ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v),
    }));
  }

  protected revertVersion(version: ContentVersion): void {
    this.confirmationService.confirm({
      message: '確定要將這筆資料還原到此版本嗎？',
      header: '還原版本',
      acceptLabel: '確定還原',
      rejectLabel: '取消',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        void this.doRevert(version);
      },
    });
  }

  private async doRevert(version: ContentVersion): Promise<void> {
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
