# 前台頁籤顯示開關 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 後台可個別開關前台導覽列的 8 個頁籤，關閉的頁籤不出現在前台導覽列。

**Architecture:** `home_settings` 單列資料表加 `nav_visibility jsonb` 欄（key 為不帶斜線的路徑段，`false` = 隱藏，缺 key = 顯示）。後台新增 `/admin/site-settings` 頁提供 8 個 toggle。前台 navbar 用原生 `fetch()` 打 Supabase REST API 取設定後過濾連結（不引入 supabase SDK，維持 initial bundle 體積）。

**Tech Stack:** Angular standalone components + signals、PrimeNG 19（ToggleSwitch）、Supabase（PostgREST）、Karma/Jasmine。

## Global Constraints

- 不新增任何 npm 依賴。
- `src/app/shared/navbar/` 及其引用鏈**禁止** import `supabase.client` 或 `@supabase/supabase-js`（見 navbar.component.ts 既有 ponytail 註記）。
- UI 文案用繁體中文（台灣用語）；程式註解與 commit 訊息用英文。
- Commit 格式：`<gitmoji> <type>(scope): <description>`，結尾加 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`。
- `nav_visibility` 的 key 是**不帶斜線**的路徑段（`goods`）；navbar 的 `path` 是**帶斜線**的（`/goods`），過濾時用 `path.slice(1)` 查表。
- PostgREST 預設回傳**陣列**：`GET .../home_settings?select=nav_visibility&limit=1` 的回應是 `[{ nav_visibility: {...} }]`，取 `rows[0]?.nav_visibility`。
- 前台任何取設定失敗（HTTP 非 2xx、網路錯誤、空陣列）一律 fail-open：全部頁籤照常顯示。

---

### Task 1: DB migration + supabase README

**Files:**
- Create: `supabase/migrations/003_nav_visibility.sql`
- Modify: `supabase/README.md`

**Interfaces:**
- Consumes: 既有 `home_settings` 資料表（單列，RLS public read / admin write 已存在）。
- Produces: `home_settings.nav_visibility` jsonb 欄位，供 Task 2（admin 寫入）與 Task 3（前台讀取）使用。

- [ ] **Step 1: 建立 migration 檔**

`supabase/migrations/003_nav_visibility.sql`：

```sql
-- Per-tab visibility control for the public navbar.
-- Key = path segment without leading slash (e.g. "goods"); false = hidden.
-- Missing key = visible, so the default '{}' keeps all tabs shown.
alter table home_settings
  add column if not exists nav_visibility jsonb not null default '{}';
```

- [ ] **Step 2: 更新 README**

`supabase/README.md` 的 Setup Instructions 現有 3 步（Dashboard、001、002），在最後加第 4 步：

```markdown
4. Run `003_nav_visibility.sql` (adds navbar tab visibility column)
```

Tables 表格中 `home_settings` 那列的描述改為：

```markdown
| home_settings | Homepage hero image + SNS links + navbar tab visibility |
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/003_nav_visibility.sql supabase/README.md
git commit -m "🗃️ feat(db): add nav_visibility column migration

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**注意**：此 SQL 需由使用者手動在 Supabase Dashboard → SQL Editor 執行，工程師無法代跑。在最終回報時提醒使用者。SQL 未執行前，前台 REST 查詢會 400，因 fail-open 設計前台仍全部顯示，不會壞。

---

### Task 2: HomeSettings model + 後台「網站設定」頁

**Files:**
- Modify: `src/app/core/models/home-settings.model.ts`
- Create: `src/app/admin/site-settings/site-settings.component.ts`
- Modify: `src/app/admin/admin.routes.ts`（`home-settings` 路由後新增一段）
- Modify: `src/app/admin/admin-layout/admin-layout.component.ts:155`（側邊選單清單）

**Interfaces:**
- Consumes: `HomeSettingsService.getAdmin(): Promise<HomeSettings>`、`HomeSettingsService.update(id: string, payload: Partial<HomeSettings>): Promise<HomeSettings>`（既有，不修改）。
- Produces: `HomeSettings.nav_visibility: Record<string, boolean>`；後台儲存的 jsonb 是 8 個 key 的完整布林 map（`{"information": true, ..., "goods": false}`）。

- [ ] **Step 1: Model 加欄位**

`src/app/core/models/home-settings.model.ts` 改為：

```ts
export interface HomeSettings {
  id: string;
  hero_image_url: string | null;
  sns_links: Record<string, string>;
  nav_visibility: Record<string, boolean>;
  updated_at: string;
}
```

- [ ] **Step 2: 建立 site-settings 元件**

`src/app/admin/site-settings/site-settings.component.ts`（結構完全比照 `home-settings.component.ts`：inline template、`HasUnsavedChanges`、sticky 儲存列、MessageService toast）：

```ts
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { HomeSettings } from '../../core/models/home-settings.model';
import { HomeSettingsService } from '../../core/services/home-settings.service';
import { HasUnsavedChanges } from '../shared/unsaved-changes.guard';

// Must match the paths in src/app/shared/navbar/navbar.component.ts (without leading slash).
const NAV_TABS = [
  { key: 'information', label: 'INFORMATION' },
  { key: 'schedule', label: 'SCHEDULE' },
  { key: 'member', label: 'MEMBER' },
  { key: 'video', label: 'VIDEO' },
  { key: 'discography', label: 'DISCOGRAPHY' },
  { key: 'goods', label: 'GOODS' },
  { key: 'rules', label: 'RULES' },
  { key: 'contact', label: 'CONTACT' },
] as const;

@Component({
  selector: 'app-site-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, ToggleSwitchModule],
  template: `
    <section class="space-y-4">
      <form class="admin-panel p-6" [formGroup]="form" (ngSubmit)="save()">
        <label class="block text-sm font-medium text-white/90">前台頁籤顯示</label>
        <p class="mt-1 text-xs text-white/45">關閉的頁籤不會出現在前台導覽列；直接輸入網址仍可開啟該頁。</p>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          @for (tab of tabs; track tab.key) {
            <label class="flex min-h-[44px] items-center justify-between rounded border border-white/10 px-4 py-2">
              <span class="text-sm tracking-widest text-white/90">{{ tab.label }}</span>
              <p-toggleswitch [formControlName]="tab.key" />
            </label>
          }
        </div>

        @if (errorMessage()) {
          <p class="mt-6 text-sm text-red-300" role="alert" aria-live="assertive">{{ errorMessage() }}</p>
        }

        <div class="sticky bottom-0 z-10 -mx-6 -mb-6 mt-8 flex flex-wrap items-center justify-between gap-3
                    border-t border-accent/20 bg-[#181411]/95 px-6 py-4 backdrop-blur">
          @if (form.dirty) {
            <span class="inline-flex items-center gap-2 text-xs text-amber-300/80">
              <i class="pi pi-info-circle"></i>尚未儲存變更
            </span>
          } @else {
            <span class="inline-flex items-center gap-2 text-xs text-white/50">
              <i class="pi pi-check-circle"></i>所有變更已儲存
            </span>
          }
          <button
            pButton
            type="submit"
            icon="pi pi-save"
            class="!min-h-[44px]"
            [disabled]="submitting() || !settings"
            [label]="submitting() ? '儲存中…' : '儲存設定'"
          ></button>
        </div>
      </form>
    </section>
  `,
})
export class SiteSettingsComponent implements OnInit, HasUnsavedChanges {
  private readonly homeSettingsService = inject(HomeSettingsService);
  private readonly messageService = inject(MessageService);
  protected settings: HomeSettings | null = null;

  protected readonly tabs = NAV_TABS;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = new FormGroup<Record<string, FormControl<boolean>>>(
    Object.fromEntries(
      NAV_TABS.map(tab => [tab.key, new FormControl(true, { nonNullable: true })]),
    ),
  );

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
  }

  async ngOnInit(): Promise<void> {
    try {
      this.settings = await this.homeSettingsService.getAdmin();
      const visibility = this.settings.nav_visibility ?? {};
      this.form.patchValue(
        Object.fromEntries(NAV_TABS.map(tab => [tab.key, visibility[tab.key] !== false])),
      );
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '網站設定載入失敗。');
    }
  }

  protected async save(): Promise<void> {
    if (!this.settings) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    try {
      this.settings = await this.homeSettingsService.update(this.settings.id, {
        nav_visibility: this.form.getRawValue(),
      });
      this.form.markAsPristine();
      this.messageService.add({
        severity: 'success',
        summary: '儲存成功',
        detail: '前台頁籤設定已更新。',
      });
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : '網站設定儲存失敗。');
    } finally {
      this.submitting.set(false);
    }
  }
}
```

- [ ] **Step 3: 加路由**

`src/app/admin/admin.routes.ts`，在 `home-settings` 路由物件之後、`audit-log` 之前插入：

```ts
{
  path: 'site-settings',
  loadComponent: () => import('./site-settings/site-settings.component').then(m => m.SiteSettingsComponent),
  canDeactivate: [unsavedChangesGuard],
  data: { title: 'Site Settings' },
},
```

- [ ] **Step 4: 加側邊選單項目**

`src/app/admin/admin-layout/admin-layout.component.ts` 選單陣列（約 155 行），在「首頁設定」之後插入：

```ts
{ label: '網站設定', link: '/admin/site-settings', icon: 'pi-sliders-h' },
```

- [ ] **Step 5: 編譯驗證**

Run: `npx ng build --configuration development 2>&1 | tail -5`
Expected: 無編譯錯誤（`Application bundle generation complete`）。

- [ ] **Step 6: Commit**

```bash
git add src/app/core/models/home-settings.model.ts src/app/admin/site-settings/ src/app/admin/admin.routes.ts src/app/admin/admin-layout/admin-layout.component.ts
git commit -m "✨ feat(admin): add site-settings page with nav tab toggles

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: 前台 navbar 依設定過濾頁籤（TDD）

**Files:**
- Create: `src/app/shared/navbar/navbar.component.spec.ts`
- Modify: `src/app/shared/navbar/navbar.component.ts`
- Modify: `src/app/shared/navbar/navbar.component.html:11,54`（`navLinks` → `navLinks()`）

**Interfaces:**
- Consumes: Task 1 的 REST 端點 `GET {environment.supabaseUrl}/rest/v1/home_settings?select=nav_visibility&limit=1`（header `apikey: environment.supabaseAnonKey`），回傳 `[{ nav_visibility?: Record<string, boolean> }]`。
- Produces: `export function filterNavLinks<T extends { path: string }>(links: readonly T[], visibility: Record<string, boolean> | null | undefined): T[]`（從 `navbar.component.ts` 匯出，供測試）。

- [ ] **Step 1: 寫失敗測試**

`src/app/shared/navbar/navbar.component.spec.ts`：

```ts
import { filterNavLinks } from './navbar.component';

describe('filterNavLinks', () => {
  const links = [
    { path: '/information', label: 'INFORMATION' },
    { path: '/goods', label: 'GOODS' },
  ];

  it('shows all links when visibility is empty', () => {
    expect(filterNavLinks(links, {})).toEqual(links);
  });

  it('hides links whose key is false (key has no leading slash)', () => {
    expect(filterNavLinks(links, { goods: false })).toEqual([links[0]]);
  });

  it('shows links missing from the map', () => {
    expect(filterNavLinks(links, { information: true })).toEqual(links);
  });

  it('shows all links when visibility is null/undefined (fail-open)', () => {
    expect(filterNavLinks(links, null)).toEqual(links);
    expect(filterNavLinks(links, undefined)).toEqual(links);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx ng test --watch=false --browsers=ChromeHeadless 2>&1 | tail -10`
Expected: FAIL — `filterNavLinks` 尚未匯出（compile error 或 `is not a function`）。

- [ ] **Step 3: 實作 navbar**

`src/app/shared/navbar/navbar.component.ts` 改為：

```ts
import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { environment } from '../../../environments/environment';

const ALL_NAV_LINKS = [
  { path: '/information', label: 'INFORMATION' },
  { path: '/schedule', label: 'SCHEDULE' },
  { path: '/member', label: 'MEMBER' },
  { path: '/video', label: 'VIDEO' },
  { path: '/discography', label: 'DISCOGRAPHY' },
  { path: '/goods', label: 'GOODS' },
  { path: '/rules', label: 'RULES' },
  { path: '/contact', label: 'CONTACT' },
];

/**
 * Filters nav links against the admin-controlled visibility map.
 * Map keys have no leading slash ("goods"); missing key or missing map = visible.
 */
export function filterNavLinks<T extends { path: string }>(
  links: readonly T[],
  visibility: Record<string, boolean> | null | undefined,
): T[] {
  if (!visibility) return [...links];
  return links.filter(link => visibility[link.path.slice(1)] !== false);
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  // ponytail: read supabase session token from localStorage instead of injecting
  // AuthService — keeps the whole supabase-js SDK out of the initial bundle.
  // Not reactive within a session; admin link appears on next page load after login.
  protected readonly isLoggedIn =
    Object.keys(localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  menuOpen = signal(false);
  scrolled = signal(false);

  navLinks = signal(filterNavLinks(ALL_NAV_LINKS, null));

  constructor() {
    // ponytail: plain fetch for the same bundle reason; PostgREST returns an
    // array, take row 0. Any failure fails open — all tabs stay visible.
    fetch(`${environment.supabaseUrl}/rest/v1/home_settings?select=nav_visibility&limit=1`, {
      headers: { apikey: environment.supabaseAnonKey },
    })
      .then(res => (res.ok ? res.json() : []))
      .then((rows: Array<{ nav_visibility?: Record<string, boolean> }>) => {
        this.navLinks.set(filterNavLinks(ALL_NAV_LINKS, rows[0]?.nav_visibility));
      })
      .catch(() => {});
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 40);
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
```

`src/app/shared/navbar/navbar.component.html` 兩處 `@for (link of navLinks; track link.path)`（第 11、54 行）改為：

```html
@for (link of navLinks(); track link.path) {
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npx ng test --watch=false --browsers=ChromeHeadless 2>&1 | tail -10`
Expected: 全部 PASS（含既有測試無回歸）。

- [ ] **Step 5: 編譯驗證（確認 navbar 沒把 SDK 拉進 initial bundle）**

Run: `npm run build 2>&1 | tail -15`
Expected: 編譯成功，initial bundle 大小與改動前相當（supabase-js 仍只在 lazy chunk）。

- [ ] **Step 6: Commit**

```bash
git add src/app/shared/navbar/
git commit -m "✨ feat(navbar): hide tabs per admin nav_visibility setting

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## 完工回報

提醒使用者：需在 Supabase Dashboard → SQL Editor 手動執行 `supabase/migrations/003_nav_visibility.sql`，執行前後台皆 fail-open 不會壞。
