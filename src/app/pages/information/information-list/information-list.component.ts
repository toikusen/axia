import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { InformationService } from '../../../core/services/information.service';
import { Information } from '../../../core/models/information.model';

@Component({
  selector: 'app-information-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-16 min-h-screen">
      <div class="mb-12">
        <span class="section-label block mb-3">INFORMATION</span>
        <div class="w-8 h-px bg-accent"></div>
      </div>
      <div class="flex flex-col divide-y divide-border">
        @for (item of items(); track item.id) {
          <a [routerLink]="['/information', item.id]"
             class="py-6 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 group">
            <span class="text-text-secondary text-xs font-mono sm:w-28 shrink-0">
              {{ item.published_at | date:'yyyy.MM.dd' }}
            </span>
            <div class="flex-1">
              @if (item.tags.length > 0) {
                <div class="flex gap-2 mb-2 flex-wrap">
                  @for (tag of item.tags; track tag) {
                    <span class="text-xs text-accent border border-accent px-2 py-0.5">{{ tag }}</span>
                  }
                </div>
              }
              <span class="text-text-primary text-sm group-hover:text-accent transition-colors duration-200">{{ item.title }}</span>
            </div>
          </a>
        } @empty {
          <p class="text-text-secondary text-sm py-8">目前沒有消息。</p>
        }
      </div>
    </div>
  `,
})
export class InformationListComponent implements OnInit {
  items = signal<Information[]>([]);
  constructor(private service: InformationService) {}
  ngOnInit() { this.service.getAll().subscribe(data => this.items.set(data)); }
}
