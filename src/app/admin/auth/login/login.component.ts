import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';
import { ensureStylesheet } from '../../shared/admin.utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="admin-surface flex min-h-screen items-center justify-center px-4 py-10">
      <div class="admin-panel w-full max-w-md p-8">
        <p class="text-xs uppercase tracking-[0.35em] text-accent">AXIA</p>
        <h1 class="mt-4 text-3xl font-semibold text-white">後台登入</h1>
        <p class="mt-3 text-sm text-white/60">使用授權的 Google 帳號登入內容管理系統。</p>

        @if (errorMessage()) {
          <p class="mt-6 text-sm text-red-300" role="alert" aria-live="assertive">
            {{ errorMessage() }}
          </p>
        }

        <button
          pButton
          type="button"
          class="mt-8 w-full admin-btn-primary"
          icon="pi pi-google"
          [disabled]="submitting()"
          [label]="submitting() ? '跳轉中…' : '使用 Google 登入'"
          (click)="signInWithGoogle()"
        ></button>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');

  async ngOnInit(): Promise<void> {
    ensureStylesheet('primeicons.css');
    const errorParam = this.route.snapshot.queryParamMap.get('error');
    if (errorParam === 'unauthorized') {
      this.errorMessage.set('此 Google 帳號無後台存取權限。');
    }

    const session = await this.authService.getSession();
    if (!session) return;

    const allowed = await this.authService.isAdminWhitelisted();
    if (allowed) {
      await this.router.navigate(['/admin/dashboard']);
    } else {
      await this.authService.signOut();
      this.errorMessage.set('此 Google 帳號無後台存取權限。');
    }
  }

  protected async signInWithGoogle(): Promise<void> {
    this.submitting.set(true);
    this.errorMessage.set('');
    try {
      await this.authService.signInWithGoogle();
      // Page redirects to Google; submitting stays true intentionally
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '登入失敗。');
      this.submitting.set(false);
    }
  }
}
