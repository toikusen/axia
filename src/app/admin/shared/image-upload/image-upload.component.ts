import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule],
  template: `
    <div class="space-y-3">
      <div
        class="flex min-h-32 items-center justify-center overflow-hidden rounded-lg border border-dashed border-accent/25 bg-black/20"
      >
        @if (imageUrl) {
          <img [src]="imageUrl" [alt]="altText"
               class="w-full"
               [class]="objectFit === 'contain' ? 'h-auto max-h-64 object-contain' : 'max-h-48 object-cover'" />
        } @else {
          <p class="text-sm text-white/40">尚未上傳圖片</p>
        }
      </div>

      <div class="flex flex-wrap gap-2">
        <input
          #fileInput
          type="file"
          accept="image/*"
          class="hidden"
          (change)="onFileSelected($event)"
        />
        <button
          pButton
          type="button"
          size="small"
          icon="pi pi-upload"
          [label]="imageUrl ? '更換圖片' : '選擇圖片'"
          [disabled]="uploading()"
          class="!min-h-[44px]"
          (click)="fileInput.click()"
        ></button>
        <button
          pButton
          type="button"
          size="small"
          severity="secondary"
          icon="pi pi-times"
          label="清除"
          [disabled]="uploading() || !imageUrl"
          class="!min-h-[44px]"
          (click)="clearImage()"
        ></button>
      </div>

      <p class="text-xs text-white/45">{{ hint }}</p>

      @if (uploading()) {
        <div class="flex items-center gap-2 text-sm text-white/60">
          <p-progressspinner strokeWidth="5" styleClass="h-5 w-5" ariaLabel="上傳中"></p-progressspinner>
          <span>上傳中…</span>
        </div>
      }

      @if (errorMessage()) {
        <p class="text-xs text-red-300">{{ errorMessage() }}</p>
      }
    </div>
  `,
})
export class ImageUploadComponent {
  private readonly storageService = inject(StorageService);

  @Input() imageUrl = '';
  @Input() uploadFolder = 'misc';
  @Input() altText = '已上傳的圖片預覽';
  @Input() objectFit: 'cover' | 'contain' = 'cover';
  @Input() hint = '建議橫幅 1200×630px，JPG 或 PNG，10MB 以內。';
  @Output() imageUrlChange = new EventEmitter<string>();

  protected readonly uploading = signal(false);
  protected readonly errorMessage = signal('');

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.errorMessage.set('');
    this.uploading.set(true);

    try {
      const url = await this.storageService.upload(file, this.uploadFolder);
      this.imageUrlChange.emit(url);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '圖片上傳失敗。');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  protected clearImage(): void {
    this.errorMessage.set('');
    this.imageUrlChange.emit('');
  }
}
