import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

interface AdminNavItem {
  label: string;
  link: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ButtonModule, ToastModule],
  template: `
    <div class="admin-surface min-h-screen">
      <a
        href="#main-content"
        class="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-bg-admin-dark"
      >跳至主要內容</a>
      <p-toast position="bottom-right" [life]="3500"></p-toast>

      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-20 bg-black/60 lg:hidden"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <div class="mx-auto grid min-h-screen max-w-[1600px] gap-6 p-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:p-6">

        <aside
          class="admin-panel flex flex-col gap-6 p-6
                 fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto
                 transition-transform duration-300
                 lg:static lg:z-auto lg:w-auto lg:overflow-visible lg:translate-x-0"
          [ngClass]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full'"
          [attr.aria-hidden]="(!sidebarOpen() && !isLargeScreen()) ? 'true' : null"
          [attr.inert]="(!sidebarOpen() && !isLargeScreen()) ? '' : null"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.35em] text-accent">AXIA</p>
            <h1 class="mt-3 text-2xl font-semibold text-white">後台管理</h1>
          </div>

          <nav #sidebarNav class="space-y-1">
            @for (item of navItems; track item.link) {
              <a
                [routerLink]="item.link"
                routerLinkActive="bg-accent text-bg-admin-dark font-medium"
                [routerLinkActiveOptions]="{ exact: item.link === '/admin/dashboard' }"
                class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/5 hover:text-white"
                (click)="sidebarOpen.set(false)"
              >
                <i [class]="'pi ' + item.icon + ' text-sm w-4 text-center'"></i>
                {{ item.label }}
              </a>
            }
          </nav>

          <div class="mt-auto">
            <button
              pButton
              type="button"
              severity="secondary"
              class="w-full"
              icon="pi pi-sign-out"
              label="登出"
              (click)="signOut()"
            ></button>
          </div>
        </aside>

        <div class="space-y-6">
          <header class="admin-panel flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div class="flex items-center gap-4">
              <button
                class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-white lg:hidden"
                (click)="openSidebar()"
                aria-label="開啟選單"
              >
                <i class="pi pi-bars text-lg"></i>
              </button>
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-accent">目前頁面</p>
                <h2 class="mt-1 text-2xl font-semibold text-white">{{ pageTitle() }}</h2>
              </div>
            </div>

            <div class="rounded-full border border-accent/20 px-4 py-2 text-sm text-white/70">
              {{ authService.currentUser()?.email || '未登入' }}
            </div>
          </header>

          <main id="main-content" class="pb-10">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild('sidebarNav') private sidebarNav!: ElementRef<HTMLElement>;

  protected readonly sidebarOpen = signal(false);

  private readonly mql = window.matchMedia('(min-width: 1024px)');
  protected readonly isLargeScreen = signal(this.mql.matches);
  private readonly onMqlChange = (e: MediaQueryListEvent) => {
    this.isLargeScreen.set(e.matches);
  };

  ngOnInit(): void {
    this.mql.addEventListener('change', this.onMqlChange);
  }

  ngOnDestroy(): void {
    this.mql.removeEventListener('change', this.onMqlChange);
  }

  protected readonly navItems: AdminNavItem[] = [
    { label: '總覽', link: '/admin/dashboard', icon: 'pi-home' },
    { label: '最新消息', link: '/admin/information', icon: 'pi-info-circle' },
    { label: '行程', link: '/admin/schedule', icon: 'pi-calendar' },
    { label: '成員', link: '/admin/member', icon: 'pi-users' },
    { label: '影片', link: '/admin/video', icon: 'pi-video' },
    { label: '唱片', link: '/admin/discography', icon: 'pi-headphones' },
    { label: '周邊商品', link: '/admin/goods', icon: 'pi-shopping-cart' },
    { label: '規章 / 頁面', link: '/admin/rules', icon: 'pi-file' },
    { label: '聯絡', link: '/admin/contact', icon: 'pi-envelope' },
    { label: '首頁設定', link: '/admin/home-settings', icon: 'pi-cog' },
    { label: '操作紀錄', link: '/admin/audit-log', icon: 'pi-list' },
  ];

  private readonly routeTitle = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.resolveTitle())
    ),
    { initialValue: 'Dashboard' }
  );

  protected readonly pageTitle = computed(() => this.routeTitle());

  protected openSidebar(): void {
    this.sidebarOpen.set(true);
    setTimeout(() => {
      const firstLink = this.sidebarNav?.nativeElement.querySelector<HTMLElement>('a');
      firstLink?.focus();
    }, 50);
  }

  protected async signOut(): Promise<void> {
    await this.authService.signOut();
  }

  private resolveTitle(): string {
    let currentRoute: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;

    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    return (currentRoute?.data?.['title'] as string | undefined) ?? 'Dashboard';
  }
}
