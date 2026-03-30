import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { DiscographyService } from '../../core/services/discography.service';
import { Discography, DISCOGRAPHY_TYPE_LABELS } from '../../core/models/discography.model';

@Component({
  selector: 'app-discography',
  standalone: true,
  imports: [DatePipe, UpperCasePipe],
  template: `
    <div class="max-w-5xl mx-auto px-6 py-16 min-h-screen">
      <div class="mb-12">
        <span class="section-label block mb-3">DISCOGRAPHY</span>
        <div class="w-8 h-px bg-accent"></div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        @for (item of items(); track item.id) {
          <div class="group">
            <!-- Cover -->
            <div class="aspect-square bg-bg-secondary border border-border rounded-sm overflow-hidden mb-3 group-hover:border-accent transition-colors duration-300">
              @if (item.cover_image_url) {
                <img [src]="item.cover_image_url" [alt]="item.title"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              } @else {
                <div class="w-full h-full flex items-center justify-center">
                  <span class="text-text-secondary text-xs tracking-widest">AXIA</span>
                </div>
              }
            </div>
            <p class="text-text-primary text-sm mb-0.5">{{ item.title }}</p>
            <div class="flex items-center gap-2">
              <span class="text-accent text-xs border border-border px-1.5 py-0.5">
                {{ typeLabel(item.type) }}
              </span>
              <span class="text-text-secondary text-xs">{{ item.release_date | date:'yyyy' }}</span>
            </div>
            <!-- Streaming links -->
            @if (streamingEntries(item).length > 0) {
              <div class="flex gap-2 mt-2 flex-wrap">
                @for (link of streamingEntries(item); track link.platform) {
                  <a [href]="link.url" target="_blank" rel="noopener"
                     class="text-text-secondary text-xs hover:text-accent transition-colors">
                    {{ link.platform | uppercase }}
                  </a>
                }
              </div>
            }
          </div>
        }
      </div>

      @if (items().length === 0) {
        <p class="text-text-secondary text-sm">目前沒有作品資料。</p>
      }
    </div>
  `,
})
export class DiscographyComponent implements OnInit {
  items = signal<Discography[]>([]);

  constructor(private service: DiscographyService) {}

  ngOnInit() {
    this.service.getAll().subscribe(data => this.items.set(data));
  }

  typeLabel(type: Discography['type']): string {
    return DISCOGRAPHY_TYPE_LABELS[type];
  }

  streamingEntries(item: Discography): { platform: string; url: string }[] {
    return Object.entries(item.streaming_links).map(([platform, url]) => ({ platform, url }));
  }
}
