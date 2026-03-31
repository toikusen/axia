import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DiscographyService } from '../../core/services/discography.service';
import { GoodsService } from '../../core/services/goods.service';
import { InformationService } from '../../core/services/information.service';
import { MemberService } from '../../core/services/member.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { StaticPageService } from '../../core/services/static-page.service';
import { VideoService } from '../../core/services/video.service';
import { ContactService } from '../../core/services/contact.service';
import { VersionService } from '../../core/services/version.service';
import { formatDateLabel } from '../shared/admin.utils';

interface DashboardStat {
  label: string;
  count: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6">
      <header>
        <p class="text-xs uppercase tracking-[0.3em] text-[#c8a882]">Overview</p>
        <h1 class="mt-2 text-3xl font-semibold text-white">Dashboard</h1>
      </header>

      @if (errorMessage()) {
        <div class="admin-panel px-6 py-4 text-sm text-red-300">{{ errorMessage() }}</div>
      }

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        @for (stat of stats(); track stat.label) {
          <article class="admin-panel p-6">
            <p class="text-xs uppercase tracking-[0.25em] text-white/45">{{ stat.label }}</p>
            <p class="mt-4 text-4xl font-semibold text-white">{{ stat.count }}</p>
          </article>
        }
      </div>

      <div class="admin-panel p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-[#c8a882]">Activity</p>
            <h2 class="mt-2 text-2xl font-semibold text-white">最近 10 筆版本操作</h2>
          </div>
          @if (loading()) {
            <span class="text-sm text-white/55">載入中…</span>
          }
        </div>

        <div class="mt-6 space-y-3">
          @for (entry of recentVersions(); track entry.id) {
            <div class="rounded-2xl border border-[#c8a882]/12 bg-black/20 px-4 py-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-white">
                    {{ entry.table_name }} / {{ entry.action }}
                  </p>
                  <p class="mt-1 text-xs text-white/55">
                    {{ entry.changed_by_email || entry.changed_by || '未知使用者' }}
                  </p>
                </div>
                <p class="text-xs text-white/45">{{ formatLabel(entry.changed_at) }}</p>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-white/55">目前沒有版本操作紀錄。</p>
          }
        </div>
      </div>
    </section>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly informationService = inject(InformationService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly memberService = inject(MemberService);
  private readonly videoService = inject(VideoService);
  private readonly discographyService = inject(DiscographyService);
  private readonly goodsService = inject(GoodsService);
  private readonly staticPageService = inject(StaticPageService);
  private readonly contactService = inject(ContactService);
  private readonly versionService = inject(VersionService);

  protected readonly stats = signal<DashboardStat[]>([]);
  protected readonly recentVersions = signal(awaitedEmptyArray());
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const [
        informationCount,
        scheduleCount,
        memberCount,
        videoCount,
        discographyCount,
        goodsCount,
        staticPages,
        messageCount,
        recentVersions,
      ] = await Promise.all([
        this.informationService.count(),
        this.scheduleService.count(),
        this.memberService.count(),
        this.videoService.count(),
        this.discographyService.count(),
        this.goodsService.count(),
        this.staticPageService.listAdmin(),
        this.contactService.count(),
        this.versionService.getRecent(10),
      ]);

      this.stats.set([
        { label: 'Information', count: informationCount },
        { label: 'Schedule', count: scheduleCount },
        { label: 'Member', count: memberCount },
        { label: 'Video', count: videoCount },
        { label: 'Discography', count: discographyCount },
        { label: 'Goods', count: goodsCount },
        {
          label: 'Rules / Pages',
          count: staticPages.filter(page => page.slug !== 'contact-info').length,
        },
        { label: 'Contact Messages', count: messageCount },
      ]);
      this.recentVersions.set(recentVersions);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Dashboard 載入失敗。');
    } finally {
      this.loading.set(false);
    }
  }

  protected formatLabel(value: string): string {
    return formatDateLabel(value);
  }
}

function awaitedEmptyArray() {
  return [] as Awaited<ReturnType<VersionService['getRecent']>>;
}
