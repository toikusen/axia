import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { HomeSettings } from '../../core/models/home-settings.model';
import { HomeSettingsService } from '../../core/services/home-settings.service';
import { sanitizeStringMap } from '../shared/admin.utils';
import { ImageUploadComponent } from '../shared/image-upload/image-upload.component';
import { JsonMapInputComponent } from '../shared/json-map-input/json-map-input.component';
import { HasUnsavedChanges } from '../shared/unsaved-changes.guard';

@Component({
  selector: 'app-home-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, ImageUploadComponent, JsonMapInputComponent],
  template: `
    <section class="space-y-4">
      <form class="admin-panel p-6" [formGroup]="form" (ngSubmit)="save()">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-3 md:col-span-2">
            <label class="block text-sm font-medium text-white/90">Hero 圖片</label>
            <app-image-upload
              [imageUrl]="heroImageUrl()"
              uploadFolder="home-settings"
              objectFit="contain"
              hint="超寬橫幅，建議 1920×1080px 以上（圖內文字置中）。"
              (imageUrlChange)="updateImage($event)"
            ></app-image-upload>
          </div>

          @if (heroImageUrl()) {
            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-medium text-white/90">前台 Hero 預覽</label>
              <div class="relative overflow-hidden rounded-lg bg-[#0e0c0a]">
                <!-- 模擬導覽列 -->
                <div class="absolute inset-x-0 top-0 z-10 flex h-10 items-center justify-between px-4
                            bg-transparent">
                  <span class="font-serif text-sm tracking-[0.25em] text-[#ddd8cf]">AXIA</span>
                  <div class="hidden items-center gap-3 sm:flex">
                    <span class="text-[9px] tracking-widest text-[#9c9aa4]">INFORMATION</span>
                    <span class="text-[9px] tracking-widest text-[#9c9aa4]">SCHEDULE</span>
                    <span class="text-[9px] tracking-widest text-[#9c9aa4]">MEMBER</span>
                    <span class="text-[9px] tracking-widest text-[#9c9aa4]">VIDEO</span>
                    <span class="text-[9px] tracking-widest text-[#9c9aa4]">DISCOGRAPHY</span>
                    <span class="text-[9px] tracking-widest text-[#9c9aa4]">GOODS</span>
                  </div>
                  <div class="flex flex-col gap-[3px] sm:hidden">
                    <span class="block h-px w-4 bg-[#ddd8cf]"></span>
                    <span class="block h-px w-4 bg-[#ddd8cf]"></span>
                    <span class="block h-px w-4 bg-[#ddd8cf]"></span>
                  </div>
                </div>
                <!-- KV 圖 -->
                <img [src]="heroImageUrl()" alt="AXIA"
                     class="block mx-auto h-auto w-full max-w-full" />
                <!-- 底部漸層 -->
                <div class="pointer-events-none absolute inset-x-0 bottom-0 h-16
                            bg-gradient-to-b from-transparent to-[#222428]"></div>
              </div>
              <p class="text-xs text-white/45">模擬前台效果（實際寬度上限 1180px，導覽列與底部漸層為裝飾用）。</p>
            </div>
          }

          <div class="space-y-3 md:col-span-2">
            <label class="block text-sm font-medium text-white/90">社群連結</label>
            <p class="text-xs text-white/45">填平台名稱與網址，會變成首頁/頁尾的社群圖示，沒有的留空即可。</p>
            <app-json-map-input formControlName="sns_links"></app-json-map-input>
          </div>
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
            [disabled]="submitting() || !settingsId()"
            [label]="submitting() ? '儲存中…' : '儲存設定'"
          ></button>
        </div>
      </form>
    </section>
  `,
})
export class HomeSettingsComponent implements OnInit, HasUnsavedChanges {
  private readonly homeSettingsService = inject(HomeSettingsService);
  private readonly messageService = inject(MessageService);
  private settings: HomeSettings | null = null;

  protected readonly settingsId = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly heroImageUrl = signal('');
  protected readonly form = new FormGroup({
    sns_links: new FormControl<Record<string, string>>({}, { nonNullable: true }),
  });

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
      this.settingsId.set(this.settings.id);
      this.heroImageUrl.set(this.settings.hero_image_url ?? '');
      this.form.patchValue({
        sns_links: sanitizeStringMap(this.settings.sns_links),
      });
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '首頁設定載入失敗。');
    }
  }

  protected updateImage(url: string): void {
    this.heroImageUrl.set(url);
    this.form.markAsDirty();
  }

  protected async save(): Promise<void> {
    if (!this.settings) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    try {
      this.settings = await this.homeSettingsService.update(this.settings.id, {
        hero_image_url: this.heroImageUrl() || null,
        sns_links: sanitizeStringMap(this.form.getRawValue().sns_links),
      });
      this.form.markAsPristine();
      this.messageService.add({
        severity: 'success',
        summary: '儲存成功',
        detail: '首頁設定已更新。',
      });
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '首頁設定儲存失敗。');
    } finally {
      this.submitting.set(false);
    }
  }
}
