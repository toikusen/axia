import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { HomeSettings } from '../../core/models/home-settings.model';
import { HomeSettingsService } from '../../core/services/home-settings.service';
import { sanitizeStringMap } from '../shared/admin.utils';
import { ImageUploadComponent } from '../shared/image-upload/image-upload.component';
import { JsonMapInputComponent } from '../shared/json-map-input/json-map-input.component';

@Component({
  selector: 'app-home-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, ImageUploadComponent, JsonMapInputComponent],
  template: `
    <section class="space-y-6">
      <header>
        <p class="text-xs uppercase tracking-[0.3em] text-[#c8a882]">Home</p>
        <h1 class="mt-2 text-3xl font-semibold text-white">首頁設定</h1>
      </header>

      <form class="admin-panel p-6" [formGroup]="form" (ngSubmit)="save()">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-3 md:col-span-2">
            <label class="block text-sm font-medium text-white/90">Hero 圖片</label>
            <app-image-upload
              [imageUrl]="heroImageUrl()"
              uploadFolder="home-settings"
              (imageUrlChange)="updateImage($event)"
            ></app-image-upload>
          </div>

          <div class="space-y-3 md:col-span-2">
            <label class="block text-sm font-medium text-white/90">SNS Links</label>
            <app-json-map-input formControlName="sns_links"></app-json-map-input>
          </div>
        </div>

        @if (errorMessage()) {
          <p class="mt-6 text-sm text-red-300">{{ errorMessage() }}</p>
        }

        <div class="mt-8">
          <button
            pButton
            type="submit"
            icon="pi pi-save"
            [disabled]="submitting() || !settingsId()"
            [label]="submitting() ? '儲存中…' : '儲存設定'"
          ></button>
        </div>
      </form>
    </section>
  `,
})
export class HomeSettingsComponent implements OnInit {
  private readonly homeSettingsService = inject(HomeSettingsService);
  private settings: HomeSettings | null = null;

  protected readonly settingsId = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly heroImageUrl = signal('');
  protected readonly form = new FormGroup({
    sns_links: new FormControl<Record<string, string>>({}, { nonNullable: true }),
  });

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
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '首頁設定儲存失敗。');
    } finally {
      this.submitting.set(false);
    }
  }
}
