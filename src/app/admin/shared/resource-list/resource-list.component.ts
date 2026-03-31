import { CommonModule } from '@angular/common';
import { Component, Injector, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { getAdminResourceConfig } from '../resource-registry';
import { AdminResourceKey } from '../admin.types';
import { VersionHistoryComponent } from '../version-history/version-history.component';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    ConfirmDialogModule,
    TableModule,
    VersionHistoryComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <p-confirmdialog></p-confirmdialog>

    <section class="space-y-4">
      <div class="flex justify-end">
        <a pButton [routerLink]="['new']" icon="pi pi-plus" label="新增"></a>
      </div>

      <div class="admin-panel overflow-x-auto">
        @if (errorMessage()) {
          <div class="border-b border-accent/10 px-6 py-4 text-sm text-red-300" role="alert" aria-live="assertive">
            {{ errorMessage() }}
          </div>
        }

        <p-table
          [value]="items()"
          [loading]="loading()"
          styleClass="admin-data-table"
          dataKey="id"
        >
          <ng-template pTemplate="header">
            <tr>
              @for (column of config().columns; track column.header) {
                <th>{{ column.header }}</th>
              }
              <th class="w-36">操作</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-item>
            <tr>
              @for (column of config().columns; track column.header) {
                <td>{{ getCellValue(item, column.key, column.render) }}</td>
              }
              <td>
                <div class="flex gap-1">
                  <a
                    pButton
                    [routerLink]="[item.id]"
                    severity="secondary"
                    icon="pi pi-pencil"
                    text
                    aria-label="編輯"
                    class="!min-h-[44px] !min-w-[44px]"
                  ></a>
                  <button
                    pButton
                    type="button"
                    severity="secondary"
                    icon="pi pi-history"
                    text
                    aria-label="版本歷史"
                    class="!min-h-[44px] !min-w-[44px]"
                    (click)="openHistory(recordId(item))"
                  ></button>
                  <button
                    pButton
                    type="button"
                    severity="danger"
                    icon="pi pi-trash"
                    text
                    aria-label="刪除"
                    class="!min-h-[44px] !min-w-[44px]"
                    (click)="confirmDelete(recordId(item))"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="config().columns.length + 1" class="px-6 py-12 text-center text-sm text-white/55">
                目前沒有資料。
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <app-version-history
        [visible]="historyVisible()"
        [tableName]="config().tableName"
        [recordId]="selectedRecordId()"
        (visibleChange)="historyVisible.set($event)"
        (reverted)="reload()"
      />
    </section>
  `,
})
export class ResourceListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly resourceKey = this.route.snapshot.data['resourceKey'] as AdminResourceKey;

  protected readonly config = computed(() => getAdminResourceConfig(this.resourceKey));
  protected readonly items = signal<Record<string, unknown>[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly historyVisible = signal(false);
  protected readonly selectedRecordId = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  protected getCellValue(
    item: Record<string, unknown>,
    key?: string,
    render?: (item: Record<string, unknown>) => string
  ): string {
    if (render) {
      return render(item);
    }

    if (!key) {
      return '—';
    }

    const value = item[key];

    if (value === null || value === undefined || value === '') {
      return '—';
    }

    return String(value);
  }

  protected openHistory(recordId: string): void {
    this.selectedRecordId.set(recordId);
    this.historyVisible.set(true);
  }

  protected recordId(item: Record<string, unknown>): string {
    return String(item['id'] ?? '');
  }

  protected confirmDelete(recordId: string): void {
    this.confirmationService.confirm({
      message: '刪除後仍可透過版本歷史還原。確定繼續嗎？',
      header: `刪除${this.config().singularLabel}`,
      acceptLabel: '刪除',
      rejectLabel: '取消',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        void this.deleteRecord(recordId);
      },
    });
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      this.items.set(await this.config().loadList(this.injector));
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '資料載入失敗。');
    } finally {
      this.loading.set(false);
    }
  }

  private async deleteRecord(recordId: string): Promise<void> {
    try {
      await this.config().delete(this.injector, recordId);
      await this.reload();
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '刪除失敗。');
    }
  }
}
