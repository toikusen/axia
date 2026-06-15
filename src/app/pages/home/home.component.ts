import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { InformationService } from '../../core/services/information.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { HomeSettingsService } from '../../core/services/home-settings.service';
import { Information } from '../../core/models/information.model';
import { Schedule } from '../../core/models/schedule.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <!-- Hero Section -->
    <section class="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-bg via-bg-secondary to-bg z-0">
        @if (heroImageUrl()) {
          <img
            [src]="heroImageUrl()!"
            alt="AXIA"
            class="w-full h-full object-cover opacity-40"
          />
        }
      </div>
      <div class="absolute inset-0 z-10 pointer-events-none"
           style="background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>');opacity:0.04">
      </div>
      <div class="relative z-20 text-center px-6">
        <h1 class="axia-logo text-7xl md:text-9xl tracking-widest3 mb-6">AXIA</h1>
        <div class="w-16 h-px bg-accent mx-auto"></div>
      </div>
    </section>

    <!-- Latest Information -->
    <section class="max-w-4xl mx-auto px-6 py-16">
      <div class="flex items-center justify-between mb-8">
        <span class="section-label">INFORMATION</span>
        <a routerLink="/information" class="link-cta">VIEW ALL →</a>
      </div>
      <div class="flex flex-col divide-y divide-border">
        @for (item of latestNews(); track item.id) {
          <a [routerLink]="['/information', item.id]"
             class="py-5 flex items-start gap-4 hover:text-accent transition-colors duration-200 group">
            <span class="text-text-secondary text-xs font-mono w-24 shrink-0 pt-0.5">
              {{ item.published_at | date:'yyyy.MM.dd' }}
            </span>
            <span class="text-text-primary text-sm group-hover:text-accent transition-colors">{{ item.title }}</span>
          </a>
        } @empty {
          <p class="text-text-secondary text-sm py-4">目前沒有消息。</p>
        }
      </div>
    </section>

    <!-- Upcoming Schedule -->
    <section class="max-w-4xl mx-auto px-6 py-16 border-t border-border">
      <div class="flex items-center justify-between mb-8">
        <span class="section-label">SCHEDULE</span>
        <a routerLink="/schedule" class="link-cta">VIEW ALL →</a>
      </div>
      <div class="flex flex-col divide-y divide-border">
        @for (item of upcomingSchedule(); track item.id) {
          <div class="py-5 flex items-start gap-6">
            <div class="text-center w-12 shrink-0">
              <div class="text-accent font-mono text-lg leading-none">
                {{ item.event_date | date:'dd' }}
              </div>
              <div class="text-text-secondary text-xs uppercase">
                {{ item.event_date | date:'MMM' }}
              </div>
            </div>
            <div>
              <p class="text-text-primary text-sm mb-1">{{ item.event_name }}</p>
              <p class="text-text-secondary text-xs">{{ item.venue }}</p>
            </div>
          </div>
        } @empty {
          <p class="text-text-secondary text-sm py-4">目前沒有近期行程。</p>
        }
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  latestNews = signal<Information[]>([]);
  upcomingSchedule = signal<Schedule[]>([]);
  heroImageUrl = signal<string | null>(null);

  constructor(
    private infoService: InformationService,
    private scheduleService: ScheduleService,
    private homeSettingsService: HomeSettingsService,
  ) {}

  ngOnInit() {
    this.infoService.getLatest(3).subscribe(data => this.latestNews.set(data));
    this.scheduleService.getUpcoming(3).subscribe(data => this.upcomingSchedule.set(data));
    this.homeSettingsService.get().subscribe({
      next: settings => this.heroImageUrl.set(settings.hero_image_url),
      error: () => {} // hero image is optional
    });
  }
}
