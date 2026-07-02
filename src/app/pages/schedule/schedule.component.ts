import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ScheduleService } from '../../core/services/schedule.service';
import { Schedule } from '../../core/models/schedule.model';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-16 min-h-screen">
      <div class="mb-12">
        <span class="section-label block mb-3">SCHEDULE</span>
        <div class="w-8 h-px bg-accent"></div>
      </div>

      @if (upcoming().length > 0) {
        <div class="mb-16">
          <h2 class="text-xs text-text-secondary tracking-widest uppercase mb-6">UPCOMING</h2>
          @for (item of upcoming(); track item.id) {
            <div class="py-6 flex gap-6 items-start border-b border-border last:border-0">
              <div class="text-center w-14 shrink-0">
                <div class="text-accent font-mono text-2xl leading-none">{{ item.event_date | date:'dd' }}</div>
                <div class="text-text-secondary text-xs uppercase mt-0.5">{{ item.event_date | date:'MMM' }}</div>
                <div class="text-text-secondary text-xs">{{ item.event_date | date:'yyyy' }}</div>
              </div>
              <div class="border-l border-border pl-6 flex-1">
                <p class="text-text-primary mb-1">{{ item.event_name }}</p>
                <p class="text-text-secondary text-sm">{{ item.venue }}</p>
                @if (item.notes) {
                  <p class="text-text-secondary text-xs mt-2 leading-relaxed">{{ item.notes }}</p>
                }
                @if (item.ticket_url) {
                  <a [href]="item.ticket_url" target="_blank" rel="noopener"
                     class="btn-primary inline-block mt-4 text-xs">TICKET →</a>
                }
              </div>
            </div>
          }
        </div>
      }

      @if (past().length > 0) {
        <div>
          <h2 class="text-xs text-text-secondary tracking-widest uppercase mb-6">PAST</h2>
          @for (item of past(); track item.id) {
            <div class="py-4 flex gap-6 items-start border-b border-border/50 last:border-0 opacity-50">
              <div class="text-center w-14 shrink-0">
                <div class="font-mono text-lg leading-none">{{ item.event_date | date:'dd' }}</div>
                <div class="text-text-secondary text-xs uppercase mt-0.5">{{ item.event_date | date:'MMM' }}</div>
              </div>
              <div class="border-l border-border/50 pl-6 flex-1">
                <p class="text-sm">{{ item.event_name }}</p>
                <p class="text-text-secondary text-xs">{{ item.venue }}</p>
              </div>
            </div>
          }
        </div>
      }

      @if (items().length === 0) {
        <p class="text-text-secondary text-sm">目前沒有行程資訊。</p>
      }
    </div>
  `,
})
export class ScheduleComponent implements OnInit {
  items = signal<Schedule[]>([]);
  upcoming = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.items().filter(i => new Date(i.event_date) >= today);
  });
  past = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.items().filter(i => new Date(i.event_date) < today).reverse();
  });
  constructor(private service: ScheduleService) {}
  ngOnInit() { this.service.getAll().subscribe(data => this.items.set(data)); }
}
