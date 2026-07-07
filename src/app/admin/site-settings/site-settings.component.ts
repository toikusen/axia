import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { HomeSettings } from '../../core/models/home-settings.model';
import { HomeSettingsService } from '../../core/services/home-settings.service';
import { HasUnsavedChanges } from '../shared/unsaved-changes.guard';

// Must match the paths in src/app/shared/navbar/navbar.component.ts (without leading slash).
const NAV_TABS = [
  { key: 'information', label: 'INFORMATION' },
  { key: 'schedule', label: 'SCHEDULE' },
  { key: 'member', label: 'MEMBER' },
  { key: 'video', label: 'VIDEO' },
  { key: 'discography', label: 'DISCOGRAPHY' },
  { key: 'goods', label: 'GOODS' },
  { key: 'rules', label: 'RULES' },
  { key: 'contact', label: 'CONTACT' },
] as const;

@Component({
  selector: 'app-site-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, ToggleSwitchModule],
  template: `
    <section class="space-y-4">
      <form class="admin-panel p-6" [formGroup]="form" (ngSubmit)="save()">
        <label class="block text-sm font-medium text-white/90">前台頁籤顯示</label>
        <p class="mt-1 text-xs text-white/45">關閉的頁籤不會出現在前台導覽列；直接輸入網址仍可開啟該頁。</p>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          @for (tab of tabs; track tab.key) {
            <label class="flex min-h-[44px] items-center justify-between rounded border border-white/10 px-4 py-2">
              <span class="text-sm tracking-widest text-white/90">{{ tab.label }}</span>
              <p-toggleswitch [formControlName]="tab.key" />
            </label>
          }
        </div>

        @if (errorMessage()) {
          <p class="mt-6 text-sm text-red-300" role="alert" aria-live="assertive">{{ errorMessage() }}</p>
        }

        <div class="sticky bottom-0 z-10 -mx-6 -mb-6 mt-8 flex flex-wrap items-center justify-between gap-3
                    border-t border-accent/20 bg-[#181411]/95 px-6 py-4 backdrop-blur">
          @if (form.dirty) {
            <span class="inline-flex items-center gap-2 text-xs text-amber-300/80">
              <i class="pi pi-info-circle"></i>尚未儲存變更
            </span>
          } @else {
            <span class="inline-flex items-center gap-2 text-xs text-white/50">
              <i class="pi pi-check-circle"></i>所有變更已儲存
            </span>
          }
          <button
            pButton
            type="submit"
            icon="pi pi-save"
            class="!min-h-[44px]"
            [disabled]="submitting() || !settings"
            [label]="submitting() ? '儲存中…' : '儲存設定'"
          ></button>
        </div>
      </form>
    </section>
  `,
})
export class SiteSettingsComponent implements OnInit, HasUnsavedChanges {
  private readonly homeSettingsService = inject(HomeSettingsService);
  private readonly messageService = inject(MessageService);
  protected settings: HomeSettings | null = null;

  protected readonly tabs = NAV_TABS;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = new FormGroup<Record<string, FormControl<boolean>>>(
    Object.fromEntries(
      NAV_TABS.map(tab => [tab.key, new FormControl(true, { nonNullable: true })]),
    ),
  );

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
  }

  async ngOnInit(): Promise<void> {
    try {
      this.settings = await this.homeSettingsService.getAdmin();
      const visibility = this.settings.nav_visibility ?? {};
      this.form.patchValue(
        Object.fromEntries(NAV_TABS.map(tab => [tab.key, visibility[tab.key] !== false])),
      );
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '網站設定載入失敗。');
    }
  }

  protected async save(): Promise<void> {
    if (!this.settings) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    try {
      this.settings = await this.homeSettingsService.update(this.settings.id, {
        nav_visibility: this.form.getRawValue(),
      });
      this.form.markAsPristine();
      this.messageService.add({
        severity: 'success',
        summary: '儲存成功',
        detail: '前台頁籤設定已更新。',
      });
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '網站設定儲存失敗。');
    } finally {
      this.submitting.set(false);
    }
  }
}
