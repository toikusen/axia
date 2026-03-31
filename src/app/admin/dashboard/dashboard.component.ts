import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  icon: string;
  link: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="space-y-6">
      @if (errorMessage()) {
        <div class="admin-panel px-6 py-4 text-sm text-red-300" role="alert" aria-live="assertive">{{ errorMessage() }}</div>
      }

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @for (stat of stats(); track stat.label) {
          <a
            [routerLink]="stat.link"
            class="admin-panel block cursor-pointer p-5 transition hover:border-accent/40 hover:shadow-lg"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-xs uppercase tracking-[0.2em] text-white/45">{{ stat.label }}</p>
              <i [class]="'pi ' + stat.icon + ' text-sm text-accent/50'"></i>
            </div>
            <p class="mt-4 text-4xl font-semibold text-white">{{ stat.count }}</p>
          </a>
        }
      </div>

      <div class="admin-panel p-6">
        <div class="mb-4 flex items-center justify-between gap-4">
          <h2 class="text-base font-semibold text-white">最近操作</h2>
          @if (loading()) {
            <span class="text-xs text-white/45">載入中…</span>
          }
        </div>

        <div class="divide-y divide-accent/10">
          @for (entry of recentVersions(); track entry.id) {
            <div class="flex items-center justify-between gap-4 py-3">
              <div class="flex min-w-0 items-center gap-3">
                <span class="shrink-0 rounded bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
                  {{ entry.action }}
                </span>
                <span class="truncate text-sm text-white">{{ entry.table_name }}</span>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-xs text-white/45">{{ formatLabel(entry.changed_at) }}</p>
                <p class="text-xs text-white/30">{{ entry.changed_by_email || entry.changed_by || '未知' }}</p>
              </div>
            </div>
          } @empty {
            <p class="py-6 text-center text-sm text-white/45">目前沒有版本操作紀錄。</p>
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
        { label: 'Information', count: informationCount, icon: 'pi-info-circle', link: '/admin/information' },
        { label: 'Schedule', count: scheduleCount, icon: 'pi-calendar', link: '/admin/schedule' },
        { label: 'Member', count: memberCount, icon: 'pi-users', link: '/admin/member' },
        { label: 'Video', count: videoCount, icon: 'pi-video', link: '/admin/video' },
        { label: 'Discography', count: discographyCount, icon: 'pi-headphones', link: '/admin/discography' },
        { label: 'Goods', count: goodsCount, icon: 'pi-shopping-cart', link: '/admin/goods' },
        {
          label: 'Rules / Pages',
          count: staticPages.filter(page => page.slug !== 'contact-info').length,
          icon: 'pi-file',
          link: '/admin/rules',
        },
        { label: 'Contact Messages', count: messageCount, icon: 'pi-envelope', link: '/admin/contact' },
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
