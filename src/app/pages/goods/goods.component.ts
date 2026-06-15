import { Component, OnInit, signal } from '@angular/core';
import { GoodsService } from '../../core/services/goods.service';
import { Goods } from '../../core/models/goods.model';

@Component({
  selector: 'app-goods',
  standalone: true,
  template: `
    <div class="max-w-5xl mx-auto px-6 py-16 min-h-screen">
      <div class="mb-12">
        <span class="section-label block mb-3">GOODS</span>
        <div class="w-8 h-px bg-accent"></div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        @for (item of items(); track item.id) {
          <div class="group relative flex flex-col h-full">
            <!-- Image -->
            <div class="aspect-square bg-bg-secondary border border-border rounded-sm overflow-hidden mb-3 group-hover:border-accent transition-colors duration-300 relative">
              @if (item.image_url) {
                <img [src]="item.image_url" [alt]="item.name"
                     class="w-full h-full object-cover"
                     [class.opacity-40]="item.is_sold_out" />
              }
              @if (item.is_sold_out) {
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-text-secondary text-xs tracking-widest border border-border px-3 py-1.5 bg-bg">SOLD OUT</span>
                </div>
              }
            </div>
            <p class="text-text-primary text-sm mb-1 line-clamp-2 min-h-[2.6em]">{{ item.name }}</p>
            @if (item.description) {
              <p class="text-text-secondary text-xs mb-2 line-clamp-2 min-h-[2.8em]">{{ item.description }}</p>
            }
            @if (item.purchase_url && !item.is_sold_out) {
              <div class="mt-auto">
                <a [href]="item.purchase_url" target="_blank" rel="noopener"
                   class="btn-primary text-xs inline-block">購買 →</a>
              </div>
            }
          </div>
        }
      </div>

      @if (items().length === 0) {
        <p class="text-text-secondary text-sm">目前沒有商品資料。</p>
      }
    </div>
  `,
})
export class GoodsComponent implements OnInit {
  items = signal<Goods[]>([]);

  constructor(private service: GoodsService) {}

  ngOnInit() {
    this.service.getAll().subscribe(data => this.items.set(data));
  }
}
