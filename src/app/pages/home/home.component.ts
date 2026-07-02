import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { InformationService } from '../../core/services/information.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { HomeSettingsService } from '../../core/services/home-settings.service';
import { MemberService } from '../../core/services/member.service';
import { Information } from '../../core/models/information.model';
import { Schedule } from '../../core/models/schedule.model';
import { Member } from '../../core/models/member.model';

const HERO_URL_CACHE_KEY = 'axia-hero-url';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-[#0e0c0a] -mt-16 pt-16">
      @if (heroImageUrl()) {
        <img [src]="heroImageUrl()" alt="AXIA" fetchpriority="high"
             class="block mx-auto h-auto w-full max-w-[1180px]" />
      } @else if (!heroChecked()) {
        <!-- Placeholder while hero URL loads — avoids logo→image swap (CLS) -->
        <div class="min-h-[60vh]"></div>
      } @else {
        <div class="relative flex items-center justify-center min-h-[60vh]
                    bg-[radial-gradient(130%_100%_at_50%_42%,#2c2e34_0%,#222428_56%,#1b1d21_100%)]">
          <img src="assets/axia-logo.png" alt="AXIA"
               class="block mx-auto h-auto w-[300px] md:w-[440px] lg:w-[540px] max-w-[90%]" />
        </div>
      }
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-[150px]
                  bg-gradient-to-b from-transparent to-bg"></div>
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

    <!-- Members -->
    <section class="max-w-4xl mx-auto px-6 py-16 border-t border-border">
      <div class="flex items-center justify-between mb-8">
        <span class="section-label">MEMBER</span>
        <a routerLink="/member" class="link-cta">VIEW ALL →</a>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (member of members(); track member.id) {
          <a [routerLink]="['/member', member.id]"
             class="group relative overflow-hidden border border-border hover:border-accent transition-all duration-300 block">
            <div class="aspect-[3/4] bg-bg-secondary overflow-hidden">
              @if (member.photo_url) {
                <img [src]="member.photo_url" [alt]="member.name" loading="lazy"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              } @else {
                <div class="w-full h-full flex items-center justify-center">
                  <span class="text-text-secondary text-4xl font-display">{{ member.name[0] }}</span>
                </div>
              }
            </div>
            <div class="p-3 border-t" [style.border-color]="member.color_hex">
              <p class="text-text-primary text-sm font-display tracking-widest break-words">{{ member.name }}</p>
            </div>
          </a>
        }
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  latestNews = signal<Information[]>([]);
  upcomingSchedule = signal<Schedule[]>([]);
  // Seed from localStorage so repeat visitors start the hero download immediately
  // instead of waiting for the Supabase round-trip (LCP).
  heroImageUrl = signal<string | null>(localStorage.getItem(HERO_URL_CACHE_KEY));
  heroChecked = signal(!!localStorage.getItem(HERO_URL_CACHE_KEY));
  members = signal<Member[]>([]);

  constructor(
    private infoService: InformationService,
    private scheduleService: ScheduleService,
    private homeSettingsService: HomeSettingsService,
    private memberService: MemberService,
  ) {}

  ngOnInit() {
    this.infoService.getLatest(3).subscribe(data => this.latestNews.set(data));
    this.scheduleService.getUpcoming(3).subscribe(data => this.upcomingSchedule.set(data));
    this.homeSettingsService.get().subscribe({
      next: settings => {
        this.heroImageUrl.set(settings.hero_image_url);
        this.heroChecked.set(true);
        if (settings.hero_image_url) {
          localStorage.setItem(HERO_URL_CACHE_KEY, settings.hero_image_url);
        } else {
          localStorage.removeItem(HERO_URL_CACHE_KEY);
        }
      },
      error: () => this.heroChecked.set(true),
    });
    this.memberService.getAll().subscribe(data => this.members.set(data));
  }
}
