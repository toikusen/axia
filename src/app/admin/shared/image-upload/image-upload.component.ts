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
    <div class="admin-panel p-4 space-y-4">
      <div
        class="flex min-h-48 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#c8a882]/25 bg-black/20"
      >
        @if (imageUrl) {
          <img [src]="imageUrl" alt="Preview" class="max-h-60 w-full object-cover" />
        } @else {
          <p class="text-sm text-white/50">尚未上傳圖片</p>
        }
      </div>

      <div class="flex flex-wrap gap-3">
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
          icon="pi pi-upload"
          label="選擇圖片"
          [disabled]="uploading()"
          (click)="fileInput.click()"
        ></button>
        <button
          pButton
          type="button"
          severity="secondary"
          icon="pi pi-times"
          label="清除"
          [disabled]="uploading() || !imageUrl"
          (click)="clearImage()"
        ></button>
      </div>

      @if (uploading()) {
        <div class="flex items-center gap-3 text-sm text-white/70">
          <p-progressspinner
            strokeWidth="5"
            styleClass="h-8 w-8"
            ariaLabel="上傳中"
          ></p-progressspinner>
          <span>圖片上傳中…</span>
        </div>
      }

      @if (errorMessage()) {
        <p class="text-sm text-red-300">{{ errorMessage() }}</p>
      }
    </div>
  `,
})
export class ImageUploadComponent {
  private readonly storageService = inject(StorageService);

  @Input() imageUrl = '';
  @Input() uploadFolder = 'misc';
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
