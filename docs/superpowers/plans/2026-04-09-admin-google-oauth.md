# Admin Google OAuth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace admin email/password login with Google OAuth, restricted to a database whitelist of approved emails.

**Architecture:** Supabase Auth handles the Google OAuth flow and session management. After OAuth redirect back to `/admin/login`, the `authGuard` checks both session validity and presence in the `admin_whitelist` DB table. `LoginComponent` is simplified to a single Google login button.

**Tech Stack:** Angular 19 (standalone components, signals), Supabase JS v2, Karma/Jasmine, PrimeNG

---

## Prerequisites (Manual — Complete Before Coding)

### Step A: Enable Google OAuth in Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Providers → Google
2. Enable the Google provider
3. Follow Supabase docs to create a Google Cloud OAuth 2.0 client:
   - Authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Paste the Client ID and Client Secret into Supabase Dashboard
5. Save

### Step B: Seed your admin email into the migration

Before running Task 1, edit `supabase/migrations/004_admin_whitelist.sql` — replace `your-email@gmail.com` with the actual Google account email that should have admin access.

---

## File Map

| File | Action |
|------|--------|
| `supabase/migrations/004_admin_whitelist.sql` | Create |
| `src/app/core/services/auth.service.ts` | Modify — add `signInWithGoogle()`, `isAdminWhitelisted()` |
| `src/app/core/services/auth.service.spec.ts` | Create — tests for new methods |
| `src/app/admin/auth/auth.guard.ts` | Modify — add whitelist check |
| `src/app/admin/auth/auth.guard.spec.ts` | Create — tests for guard |
| `src/app/admin/auth/login/login.component.ts` | Modify — replace form with Google button |

---

## Task 1: DB Migration — admin_whitelist table

**Files:**
- Create: `supabase/migrations/004_admin_whitelist.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/004_admin_whitelist.sql
create table if not exists admin_whitelist (
  email text primary key
);

alter table admin_whitelist enable row level security;

-- Authenticated users can only check their own email
create policy "authenticated read own whitelist entry" on admin_whitelist
  for select to authenticated
  using ((auth.jwt() ->> 'email') = email);

-- Replace with actual admin email before applying
insert into admin_whitelist (email) values ('your-email@gmail.com')
on conflict (email) do nothing;
```

- [ ] **Step 2: Apply migration via Supabase CLI**

```bash
supabase db push
```

Or apply manually via Supabase Dashboard → SQL Editor if CLI is not configured.

- [ ] **Step 3: Verify via Supabase Dashboard SQL Editor**

```sql
select * from admin_whitelist;
-- Expected: one row with your email
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/004_admin_whitelist.sql
git commit -m "feat(auth): add admin_whitelist table with RLS"
```

---

## Task 2: Update AuthService — add Google OAuth methods

**Files:**
- Modify: `src/app/core/services/auth.service.ts`
- Create: `src/app/core/services/auth.service.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/core/services/auth.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { supabase } from '../supabase.client';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    // Prevent real Supabase calls during construction
    spyOn(supabase.auth, 'getSession').and.returnValue(
      Promise.resolve({ data: { session: null }, error: null })
    );
    spyOn(supabase.auth, 'onAuthStateChange').and.returnValue({
      data: { subscription: { unsubscribe: () => {} } },
    } as any);

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: Router, useValue: routerSpy }],
    });
    service = TestBed.inject(AuthService);
  });

  describe('signInWithGoogle()', () => {
    it('calls signInWithOAuth with google provider', async () => {
      const spy = spyOn(supabase.auth, 'signInWithOAuth').and.returnValue(
        Promise.resolve({ data: { provider: 'google', url: 'https://accounts.google.com' }, error: null })
      );

      await service.signInWithGoogle();

      expect(spy).toHaveBeenCalledWith(
        jasmine.objectContaining({ provider: 'google' })
      );
    });

    it('throws when Supabase returns an error', async () => {
      spyOn(supabase.auth, 'signInWithOAuth').and.returnValue(
        Promise.resolve({ data: { provider: 'google', url: null }, error: { message: 'OAuth failed', name: 'AuthError', status: 500 } as any })
      );

      await expectAsync(service.signInWithGoogle()).toBeRejected();
    });
  });

  describe('isAdminWhitelisted()', () => {
    it('returns false when no user is logged in', async () => {
      // currentUser signal is null by default in test setup
      const result = await service.isAdminWhitelisted();
      expect(result).toBeFalse();
    });

    it('returns true when user email is in whitelist', async () => {
      // Simulate a logged-in user
      (service as any).userSignal.set({ email: 'admin@example.com' });

      const fromSpy = spyOn(supabase, 'from').and.returnValue({
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: { email: 'admin@example.com' }, error: null }),
          }),
        }),
      } as any);

      const result = await service.isAdminWhitelisted();
      expect(result).toBeTrue();
      expect(fromSpy).toHaveBeenCalledWith('admin_whitelist');
    });

    it('returns false when user email is not in whitelist', async () => {
      (service as any).userSignal.set({ email: 'stranger@example.com' });

      spyOn(supabase, 'from').and.returnValue({
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      } as any);

      const result = await service.isAdminWhitelisted();
      expect(result).toBeFalse();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
ng test --include="**/auth.service.spec.ts" --watch=false
```

Expected: FAIL — `signInWithGoogle` and `isAdminWhitelisted` are not defined.

- [ ] **Step 3: Add methods to AuthService**

In `src/app/core/services/auth.service.ts`, add after the `signIn` method:

```typescript
async signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/admin/login`,
    },
  });

  if (error) {
    throw error;
  }
}

async isAdminWhitelisted(): Promise<boolean> {
  const user = this.currentUser();
  if (!user?.email) return false;

  const { data } = await supabase
    .from('admin_whitelist')
    .select('email')
    .eq('email', user.email)
    .maybeSingle();

  return data !== null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
ng test --include="**/auth.service.spec.ts" --watch=false
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/services/auth.service.ts src/app/core/services/auth.service.spec.ts
git commit -m "feat(auth): add signInWithGoogle and isAdminWhitelisted to AuthService"
```

---

## Task 3: Update authGuard — add whitelist check

**Files:**
- Modify: `src/app/admin/auth/auth.guard.ts`
- Create: `src/app/admin/auth/auth.guard.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/admin/auth/auth.guard.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../../core/services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function runGuard(): Promise<boolean> {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as Promise<boolean>
    );
  }

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getSession',
      'isAdminWhitelisted',
      'signOut',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('redirects to /admin/login when no session', async () => {
    authServiceSpy.getSession.and.returnValue(Promise.resolve(null));

    const result = await runGuard();

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('signs out and redirects with error=unauthorized when not whitelisted', async () => {
    authServiceSpy.getSession.and.returnValue(Promise.resolve({ user: {} } as any));
    authServiceSpy.isAdminWhitelisted.and.returnValue(Promise.resolve(false));
    authServiceSpy.signOut.and.returnValue(Promise.resolve());

    const result = await runGuard();

    expect(result).toBeFalse();
    expect(authServiceSpy.signOut).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/admin/login'],
      { queryParams: { error: 'unauthorized' } }
    );
  });

  it('returns true when session exists and user is whitelisted', async () => {
    authServiceSpy.getSession.and.returnValue(Promise.resolve({ user: {} } as any));
    authServiceSpy.isAdminWhitelisted.and.returnValue(Promise.resolve(true));

    const result = await runGuard();

    expect(result).toBeTrue();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
ng test --include="**/auth.guard.spec.ts" --watch=false
```

Expected: FAIL — whitelist check not implemented in guard.

- [ ] **Step 3: Update authGuard**

Replace the full contents of `src/app/admin/auth/auth.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = await auth.getSession();

  if (!session) {
    await router.navigate(['/admin/login']);
    return false;
  }

  const allowed = await auth.isAdminWhitelisted();
  if (!allowed) {
    await auth.signOut();
    await router.navigate(['/admin/login'], { queryParams: { error: 'unauthorized' } });
    return false;
  }

  return true;
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
ng test --include="**/auth.guard.spec.ts" --watch=false
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/auth/auth.guard.ts src/app/admin/auth/auth.guard.spec.ts
git commit -m "feat(auth): add whitelist check to authGuard"
```

---

## Task 4: Update LoginComponent — Google button UI

**Files:**
- Modify: `src/app/admin/auth/login/login.component.ts`

No tests for this component — it is a thin UI wrapper that delegates all logic to `AuthService`, which is already tested.

- [ ] **Step 1: Replace LoginComponent**

Replace the full contents of `src/app/admin/auth/login/login.component.ts`:

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';

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
      // Page will redirect to Google; submitting stays true intentionally
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '登入失敗。');
      this.submitting.set(false);
    }
  }
}
```

- [ ] **Step 2: Build to verify no TypeScript errors**

```bash
ng build --configuration=development 2>&1 | tail -20
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Run all tests**

```bash
ng test --watch=false
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/auth/login/login.component.ts
git commit -m "feat(auth): replace email/password login with Google OAuth button"
```

---

## Task 5: End-to-End Verification (Manual)

- [ ] **Step 1: Start dev server**

```bash
ng serve
```

- [ ] **Step 2: Test happy path**
  1. Go to `http://localhost:4200/admin/login`
  2. Click 「使用 Google 登入」
  3. Complete Google OAuth flow with the whitelisted email
  4. Should land on `/admin/dashboard`

- [ ] **Step 3: Test unauthorized path**
  1. Sign out from admin
  2. Go to `http://localhost:4200/admin/login`
  3. Click 「使用 Google 登入」
  4. Complete Google OAuth with a **non-whitelisted** Google account
  5. Should be redirected back to `/admin/login` with message 「此 Google 帳號無後台存取權限。」

- [ ] **Step 4: Test direct URL access guard**
  1. Without signing in, navigate directly to `http://localhost:4200/admin/dashboard`
  2. Should be redirected to `/admin/login`
