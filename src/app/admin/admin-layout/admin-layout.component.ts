import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

interface AdminNavItem {
  label: string;
  link: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ButtonModule],
  template: `
    <div class="admin-surface min-h-screen">
      <div class="mx-auto grid min-h-screen max-w-[1600px] gap-6 p-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:p-6">
        <aside class="admin-panel flex flex-col gap-6 p-6">
          <div>
            <p class="text-xs uppercase tracking-[0.35em] text-[#c8a882]">AXIA</p>
            <h1 class="mt-3 text-2xl font-semibold text-white">Admin Console</h1>
          </div>

          <nav class="space-y-2">
            @for (item of navItems; track item.link) {
              <a
                [routerLink]="item.link"
                routerLinkActive="bg-[#c8a882] text-[#171412]"
                [routerLinkActiveOptions]="{ exact: item.link === '/admin/dashboard' }"
                class="block rounded-2xl px-4 py-3 text-sm text-white/72 transition hover:bg-white/5 hover:text-white"
              >
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
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-[#c8a882]">Current View</p>
              <h2 class="mt-2 text-2xl font-semibold text-white">{{ pageTitle() }}</h2>
            </div>

            <div class="rounded-full border border-[#c8a882]/20 px-4 py-2 text-sm text-white/70">
              {{ authService.currentUser()?.email || '未登入' }}
            </div>
          </header>

          <main class="pb-10">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly navItems: AdminNavItem[] = [
    { label: 'Dashboard', link: '/admin/dashboard' },
    { label: 'Information', link: '/admin/information' },
    { label: 'Schedule', link: '/admin/schedule' },
    { label: 'Member', link: '/admin/member' },
    { label: 'Video', link: '/admin/video' },
    { label: 'Discography', link: '/admin/discography' },
    { label: 'Goods', link: '/admin/goods' },
    { label: 'Rules', link: '/admin/rules' },
    { label: 'Contact', link: '/admin/contact' },
    { label: 'Home Settings', link: '/admin/home-settings' },
    { label: 'Audit Log', link: '/admin/audit-log' },
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
