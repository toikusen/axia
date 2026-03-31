import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule],
  template: `
    <div class="admin-surface flex min-h-screen items-center justify-center px-4 py-10">
      <div class="admin-panel w-full max-w-md p-8">
        <p class="text-xs uppercase tracking-[0.35em] text-[#c8a882]">AXIA</p>
        <h1 class="mt-4 text-3xl font-semibold text-white">後台登入</h1>
        <p class="mt-3 text-sm text-white/60">使用 Supabase Auth 帳號登入內容管理系統。</p>

        <form class="mt-8 space-y-5" [formGroup]="form" (ngSubmit)="signIn()">
          <div class="space-y-2">
            <label class="text-sm text-white/80">Email</label>
            <input pInputText class="admin-input" formControlName="email" type="email" />
          </div>

          <div class="space-y-2">
            <label class="text-sm text-white/80">Password</label>
            <p-password
              formControlName="password"
              [feedback]="false"
              [toggleMask]="true"
              inputStyleClass="w-full"
              styleClass="block"
            ></p-password>
          </div>

          @if (errorMessage()) {
            <p class="text-sm text-red-300">{{ errorMessage() }}</p>
          }

          <button
            pButton
            type="submit"
            class="w-full"
            icon="pi pi-sign-in"
            [disabled]="submitting() || form.invalid"
            [label]="submitting() ? '登入中…' : '登入'"
          ></button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  async ngOnInit(): Promise<void> {
    const session = await this.authService.getSession();

    if (session) {
      await this.router.navigate(['/admin/dashboard']);
    }
  }

  protected async signIn(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.signIn(email, password);
      await this.router.navigate(['/admin/dashboard']);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '登入失敗。');
    } finally {
      this.submitting.set(false);
    }
  }
}
