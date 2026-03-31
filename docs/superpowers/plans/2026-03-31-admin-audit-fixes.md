# Admin Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 12 issues found in the admin backend audit (A11y, Performance, Theming, Responsive, Anti-patterns).

**Architecture:** Fixes are isolated to existing Angular components and the global styles.css. No new files needed except adding PrimeNG MessageService to app.config.ts for the toast system. All changes are additive or targeted replacements.

**Tech Stack:** Angular 18+ (signals, standalone), PrimeNG v17+, Tailwind CSS v3, TypeScript

---

## File Map

| File | Changes |
|------|---------|
| `src/styles.css` | Extract admin hex values to CSS custom properties |
| `src/app/admin/admin-layout/admin-layout.component.ts` | matchMedia fix, focus management on sidebar open, add `<p-toast>`, import ToastModule |
| `src/app/app.config.ts` | Provide `MessageService` globally |
| `src/app/admin/shared/resource-form/resource-form.component.ts` | Fix color field dual-binding, add success toast |
| `src/app/admin/shared/resource-list/resource-list.component.ts` | Increase action button touch targets |
| `src/app/admin/shared/image-upload/image-upload.component.ts` | Fix alt text |
| `src/app/admin/shared/version-history/version-history.component.ts` | Replace `confirm()` with ConfirmDialog, render JSON as key-value table |
| `src/app/admin/audit-log/audit-log.component.ts` | Add paginator to p-table |
| `src/app/admin/dashboard/dashboard.component.ts` | Stat cards become router links |
| `src/app/admin/home-settings/home-settings.component.ts` | Add success toast |
| `src/app/admin/contact/contact.component.ts` | Add success toast |

---

## Task 1: CSS Variables — Unify Admin Color Tokens

**Files:**
- Modify: `src/styles.css`

The problem: `src/styles.css` repeats the same hex values in 15+ places. If accent colour changes, every occurrence breaks. Fix by defining CSS custom properties at the top of `styles.css` and replacing all occurrences.

- [ ] **Step 1: Add CSS variable definitions at top of admin section in `src/styles.css`**

Replace the section starting at `/* Admin — Layout Shells */` with this preamble added just before it:

```css
/* ═══════════════════════════════════════════════════════════
   Admin — Design Tokens (CSS custom properties)
   ═══════════════════════════════════════════════════════════ */

:root {
  --admin-accent:        #c8a882;
  --admin-accent-subtle: rgba(200, 168, 130, 0.10);
  --admin-accent-border: rgba(200, 168, 130, 0.18);
  --admin-accent-dim:    rgba(200, 168, 130, 0.06);
  --admin-bg-dark:       #171412;
  --admin-bg-panel:      rgba(34, 29, 24, 0.92);
  --admin-bg-deep:       #1d1915;
  --admin-bg-dialog:     #221d18;
  --admin-text:          #f5efe7;
  --admin-text-muted:    rgba(245, 239, 231, 0.28);
}
```

- [ ] **Step 2: Replace all hard-coded values in `.admin-surface`**

```css
.admin-surface {
  background:
    radial-gradient(circle at top left, rgba(200, 168, 130, 0.12), transparent 30%),
    linear-gradient(180deg, var(--admin-bg-dark) 0%, #0f0d0b 100%);
  color: var(--admin-text);
}
```

- [ ] **Step 3: Replace values in `.admin-panel`**

```css
.admin-panel {
  background: var(--admin-bg-panel);
  border: 1px solid var(--admin-accent-border);
  border-radius: 1rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
}
```

- [ ] **Step 4: Replace values in `.admin-data-table` rules**

```css
.admin-data-table th,
.admin-data-table td {
  border-bottom: 1px solid rgba(200, 168, 130, 0.10);
  padding: 0.9rem 1.1rem;
  text-align: left;
  vertical-align: middle;
}

.admin-data-table th {
  background: var(--admin-accent-dim);
  color: var(--admin-accent);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  white-space: nowrap;
}

.admin-data-table tbody tr { transition: background 0.12s; }

.admin-data-table tbody tr:hover td {
  background: rgba(200, 168, 130, 0.045);
}
```

- [ ] **Step 5: Replace values in PrimeNG input overrides**

```css
input.p-inputtext,
textarea.p-inputtext,
.p-password input {
  background: rgba(255, 255, 255, 0.035) !important;
  border: 1px solid rgba(200, 168, 130, 0.48) !important;
  border-radius: 0.5rem !important;
  color: var(--admin-text) !important;
  font-family: 'Noto Sans TC', sans-serif !important;
  font-size: 0.875rem !important;
  padding: 0.625rem 0.875rem !important;
  width: 100% !important;
  outline: none !important;
  transition: border-color 0.15s, box-shadow 0.15s !important;
}

input.p-inputtext:focus,
textarea.p-inputtext:focus,
.p-password input:focus {
  border-color: var(--admin-accent) !important;
  box-shadow: 0 0 0 3px rgba(200, 168, 130, 0.12) !important;
}

input.p-inputtext::placeholder,
textarea.p-inputtext::placeholder,
.p-password input::placeholder {
  color: var(--admin-text-muted) !important;
}
```

- [ ] **Step 6: Replace values in `.admin-btn-primary` and datepicker/dialog/select overrides**

```css
.admin-btn-primary {
  background: var(--admin-accent) !important;
  border-color: var(--admin-accent) !important;
  color: var(--admin-bg-dark) !important;
  font-weight: 600 !important;
  width: 100%;
  justify-content: center;
}

.p-datepicker-panel {
  background: var(--admin-bg-deep) !important;
  border: 1px solid rgba(200, 168, 130, 0.28) !important;
  border-radius: 0.875rem !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55) !important;
  z-index: 9000 !important;
}

.p-confirmdialog .p-dialog {
  background: var(--admin-bg-dialog);
  border: 1px solid rgba(200, 168, 130, 0.22);
  border-radius: 1rem;
}

.p-select-overlay {
  background: var(--admin-bg-deep);
  border: 1px solid rgba(200, 168, 130, 0.25);
  border-radius: 0.75rem;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.50);
}

.admin-prose {
  color: var(--admin-text);
  line-height: 1.7;
}
.admin-prose a { color: #d9c2a8; }
```

- [ ] **Step 7: Verify build compiles cleanly**

```bash
cd /Users/seitumbp2025/axia && npx ng build --configuration=production 2>&1 | tail -20
```

Expected: no errors, bundle sizes similar to before.

- [ ] **Step 8: Commit**

```bash
git add src/styles.css
git commit -m "style(admin): extract magic hex values into CSS custom properties"
```

---

## Task 2: Global Toast System

**Files:**
- Modify: `src/app/app.config.ts`
- Modify: `src/app/admin/admin-layout/admin-layout.component.ts`

Add `MessageService` globally and `<p-toast>` to the admin shell so any admin component can show success/error toasts.

- [ ] **Step 1: Add MessageService to `src/app/app.config.ts` providers**

Read the file first, then add `MessageService` import and provider. The final providers array should include `MessageService`:

```typescript
import { MessageService } from 'primeng/api';

// inside ApplicationConfig.providers array, add:
MessageService,
```

- [ ] **Step 2: Add ToastModule + `<p-toast>` to `admin-layout.component.ts`**

Import `ToastModule` from `'primeng/toast'` in the imports array. Add `<p-toast>` to the template, just after the overlay `<div>`:

```typescript
// Add to imports array:
import { ToastModule } from 'primeng/toast';
```

In the template, add immediately inside the outer `<div class="admin-surface ...">` but before the grid div:

```html
<p-toast position="bottom-right" [life]="3500"></p-toast>
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/seitumbp2025/axia && npx ng build --configuration=production 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/app/app.config.ts src/app/admin/admin-layout/admin-layout.component.ts
git commit -m "feat(admin): add global toast system via PrimeNG MessageService"
```

---

## Task 3: Success Toasts in Save Components

**Files:**
- Modify: `src/app/admin/shared/resource-form/resource-form.component.ts`
- Modify: `src/app/admin/home-settings/home-settings.component.ts`
- Modify: `src/app/admin/contact/contact.component.ts`

Inject `MessageService` and show a success toast after each successful save.

- [ ] **Step 1: Update `resource-form.component.ts` — inject and show toast**

Add import and inject at top of class:

```typescript
import { MessageService } from 'primeng/api';

// Inside class:
private readonly messageService = inject(MessageService);
```

In the `save()` method, after `await this.router.navigate(...)`, add a toast before navigation (note: navigate first keeps the toast visible on the list page if you switch to showing toast on list, but since we navigate away the toast should be shown before navigate OR the toast should appear on the list after redirect — PrimeNG toast persists across navigation if MessageService is singleton):

Replace the try block in `save()`:

```typescript
try {
  const payload = this.config().fromFormValue(this.form.getRawValue());

  if (this.recordId) {
    await this.config().update(this.injector, this.recordId, payload);
  } else {
    await this.config().create(this.injector, payload);
  }

  this.messageService.add({
    severity: 'success',
    summary: '儲存成功',
    detail: `${this.config().singularLabel} 已儲存。`,
  });

  await this.router.navigate([this.config().basePath]);
} catch (error) {
  this.errorMessage.set(error instanceof Error ? error.message : '儲存失敗。');
}
```

- [ ] **Step 2: Update `home-settings.component.ts` — inject and show toast**

```typescript
import { MessageService } from 'primeng/api';

// Inside class:
private readonly messageService = inject(MessageService);
```

In the `save()` try block, after `this.settings = await this.homeSettingsService.update(...)`, add:

```typescript
this.messageService.add({
  severity: 'success',
  summary: '儲存成功',
  detail: '首頁設定已更新。',
});
```

- [ ] **Step 3: Update `contact.component.ts` — inject and show toast**

```typescript
import { MessageService } from 'primeng/api';

// Inside class:
private readonly messageService = inject(MessageService);
```

In `saveContactInfo()` try block, after `this.contactPage = await this.staticPageService.update(...)`, add:

```typescript
this.messageService.add({
  severity: 'success',
  summary: '儲存成功',
  detail: '聯絡資訊已更新。',
});
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/shared/resource-form/resource-form.component.ts \
        src/app/admin/home-settings/home-settings.component.ts \
        src/app/admin/contact/contact.component.ts
git commit -m "feat(admin): show success toast after save operations"
```

---

## Task 4: Fix Color Field Dual formControlName Binding

**Files:**
- Modify: `src/app/admin/shared/resource-form/resource-form.component.ts`

Currently both `<input type="color">` and `pInputText` share the same `formControlName`. This causes Angular to register two ControlValueAccessors on one control, leading to visual desync. Fix: remove `formControlName` from the color picker, use event binding + `stringValue()` instead.

- [ ] **Step 1: Add `updateColor()` method to `ResourceFormComponent` class**

```typescript
protected updateColor(fieldKey: string, event: Event): void {
  const input = event.target as HTMLInputElement;
  this.form.get(fieldKey)?.setValue(input.value);
  this.form.get(fieldKey)?.markAsDirty();
}
```

- [ ] **Step 2: Replace the `@case ('color')` template block**

```html
@case ('color') {
  <div class="flex items-center gap-3">
    <input
      type="color"
      class="h-10 w-14 cursor-pointer rounded border border-accent/20 bg-transparent"
      [value]="stringValue(field.key)"
      (input)="updateColor(field.key, $event)"
    />
    <input
      pInputText
      class="admin-input"
      [formControlName]="field.key"
    />
  </div>
}
```

The color picker now reads from `stringValue()` (which reads the form control) and writes via `updateColor()`. The text input remains the canonical reactive-forms control. Both stay in sync.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/shared/resource-form/resource-form.component.ts
git commit -m "fix(admin): fix color field dual formControlName binding causing value desync"
```

---

## Task 5: Replace `confirm()` with ConfirmDialog in Version History

**Files:**
- Modify: `src/app/admin/shared/version-history/version-history.component.ts`

The native `confirm()` call blocks the main thread, has no styling, and is inaccessible. Replace with PrimeNG `ConfirmationService`.

- [ ] **Step 1: Update imports and providers in `version-history.component.ts`**

```typescript
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

// In @Component decorator:
imports: [CommonModule, ButtonModule, DialogModule, DividerModule, TagModule, ConfirmDialogModule],
providers: [ConfirmationService],
```

- [ ] **Step 2: Inject ConfirmationService in the class**

```typescript
private readonly confirmationService = inject(ConfirmationService);
```

- [ ] **Step 3: Add `<p-confirmdialog>` to the template**

Add as first element inside `<p-dialog>` body (inside the outer `<div class="space-y-4">`):

```html
<p-confirmdialog></p-confirmdialog>
```

- [ ] **Step 4: Replace the `revertVersion()` method**

```typescript
protected revertVersion(version: ContentVersion): void {
  this.confirmationService.confirm({
    message: '確定要將這筆資料還原到此版本嗎？',
    header: '還原版本',
    acceptLabel: '確定還原',
    rejectLabel: '取消',
    acceptButtonStyleClass: 'p-button-danger',
    accept: () => {
      void this.doRevert(version);
    },
  });
}

private async doRevert(version: ContentVersion): Promise<void> {
  this.errorMessage.set('');
  this.revertingVersionId.set(version.id);

  try {
    await this.versionService.revert(version);
    this.reverted.emit();
    this.visibleChange.emit(false);
  } catch (error) {
    this.errorMessage.set(error instanceof Error ? error.message : '還原失敗。');
  } finally {
    this.revertingVersionId.set('');
  }
}
```

Remove the old `revertVersion()` async method entirely. The button `(click)` handler stays as `revertVersion(version)`.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/shared/version-history/version-history.component.ts
git commit -m "fix(admin): replace blocking confirm() with PrimeNG ConfirmDialog in version history"
```

---

## Task 6: Image Upload — Fix Alt Text

**Files:**
- Modify: `src/app/admin/shared/image-upload/image-upload.component.ts`

`alt="Preview"` is non-descriptive. Accept an optional `altText` input and fall back to a meaningful default.

- [ ] **Step 1: Add `@Input() altText` and update template**

In the class, add:

```typescript
@Input() altText = '已上傳的圖片預覽';
```

In the template, update the `<img>` tag:

```html
<img [src]="imageUrl" [alt]="altText" class="max-h-48 w-full object-cover" />
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/shared/image-upload/image-upload.component.ts
git commit -m "fix(admin): replace generic alt text in image upload with descriptive default"
```

---

## Task 7: Replace ResizeObserver with window.matchMedia

**Files:**
- Modify: `src/app/admin/admin-layout/admin-layout.component.ts`

`ResizeObserver` on `document.body` fires on any layout change. `window.matchMedia` fires only when the 1024px breakpoint is crossed — far more efficient.

- [ ] **Step 1: Remove ResizeObserver, add matchMedia**

Replace the current `resizeObserver` field and the `ngOnInit`/`ngOnDestroy` body with:

```typescript
private readonly mql = window.matchMedia('(min-width: 1024px)');
private readonly onMqlChange = (e: MediaQueryListEvent) => {
  this.isLargeScreen.set(e.matches);
};

ngOnInit(): void {
  this.mql.addEventListener('change', this.onMqlChange);
}

ngOnDestroy(): void {
  this.mql.removeEventListener('change', this.onMqlChange);
}
```

Remove the `ResizeObserver` import/field entirely. Update `isLargeScreen` initialisation to use `this.mql.matches`:

```typescript
protected readonly isLargeScreen = signal(this.mql.matches);
```

Note: `this.mql` must be declared before `isLargeScreen` in the class body because `isLargeScreen` references it.

Remove `OnInit, OnDestroy` from the Component decorator `implements` list if already there (they stay). Remove any reference to `ResizeObserver`.

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/admin-layout/admin-layout.component.ts
git commit -m "perf(admin): replace ResizeObserver on body with window.matchMedia for breakpoint detection"
```

---

## Task 8: Mobile Sidebar — Focus Management on Open

**Files:**
- Modify: `src/app/admin/admin-layout/admin-layout.component.ts`

When the sidebar opens on mobile, focus should move to the first nav link so keyboard and screen reader users can navigate it.

- [ ] **Step 1: Add ViewChild for the `<nav>` element**

Add to the `<nav>` in the template:

```html
<nav #sidebarNav class="space-y-1">
```

In the component class add:

```typescript
import { Component, ..., ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@ViewChild('sidebarNav') private sidebarNav!: ElementRef<HTMLElement>;
```

- [ ] **Step 2: Create `openSidebar()` method**

Replace the inline `sidebarOpen.set(true)` in the hamburger button with a method call:

```typescript
protected openSidebar(): void {
  this.sidebarOpen.set(true);
  // Allow Angular to render the sidebar (remove inert/translate) before focusing
  setTimeout(() => {
    const firstLink = this.sidebarNav?.nativeElement.querySelector<HTMLElement>('a');
    firstLink?.focus();
  }, 50);
}
```

In the template, change the hamburger button's click handler:

```html
(click)="openSidebar()"
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/admin-layout/admin-layout.component.ts
git commit -m "fix(admin): move focus to first nav link when mobile sidebar opens"
```

---

## Task 9: Audit Log — Add Paginator

**Files:**
- Modify: `src/app/admin/audit-log/audit-log.component.ts`

Loading 100 rows with no pagination is slow and hard to navigate. Enable PrimeNG's built-in paginator.

- [ ] **Step 1: Add paginator attributes to `<p-table>`**

```html
<p-table
  [value]="entries()"
  [loading]="loading()"
  styleClass="admin-data-table"
  dataKey="id"
  [paginator]="true"
  [rows]="25"
  [rowsPerPageOptions]="[25, 50, 100]"
  [showCurrentPageReport]="true"
  currentPageReportTemplate="共 {totalRecords} 筆，第 {first}–{last} 筆"
>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/audit-log/audit-log.component.ts
git commit -m "feat(admin): add pagination to audit log table"
```

---

## Task 10: Table Action Buttons — Increase Touch Targets

**Files:**
- Modify: `src/app/admin/shared/resource-list/resource-list.component.ts`

The edit/history/delete icon buttons need a minimum 44×44px touch target on mobile. Add `class="!min-w-[44px] !min-h-[44px]"` to guarantee this.

- [ ] **Step 1: Update action buttons in template**

```html
<div class="flex gap-1">
  <a
    pButton
    [routerLink]="[item.id]"
    severity="secondary"
    icon="pi pi-pencil"
    text
    aria-label="編輯"
    class="!min-w-[44px] !min-h-[44px]"
  ></a>
  <button
    pButton
    type="button"
    severity="secondary"
    icon="pi pi-history"
    text
    aria-label="版本歷史"
    class="!min-w-[44px] !min-h-[44px]"
    (click)="openHistory(recordId(item))"
  ></button>
  <button
    pButton
    type="button"
    severity="danger"
    icon="pi pi-trash"
    text
    aria-label="刪除"
    class="!min-w-[44px] !min-h-[44px]"
    (click)="confirmDelete(recordId(item))"
  ></button>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/shared/resource-list/resource-list.component.ts
git commit -m "fix(admin): ensure table action buttons meet 44x44px touch target minimum"
```

---

## Task 11: Dashboard Stat Cards — Add Navigation Links

**Files:**
- Modify: `src/app/admin/dashboard/dashboard.component.ts`

Each stat card should link to its corresponding admin list page so admins can click directly to the data.

- [ ] **Step 1: Add `link` to `DashboardStat` interface and update stats**

```typescript
interface DashboardStat {
  label: string;
  count: number;
  icon: string;
  link: string;
}
```

Update `this.stats.set([...])` to include links:

```typescript
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
```

- [ ] **Step 2: Add RouterModule import and update template**

Add `RouterModule` to the `imports` array.

Replace the `<article>` element with a `<a>` that wraps the same content:

```html
@for (stat of stats(); track stat.label) {
  <a
    [routerLink]="stat.link"
    class="admin-panel block p-5 transition hover:border-accent/40 hover:shadow-lg cursor-pointer"
  >
    <div class="flex items-start justify-between gap-2">
      <p class="text-xs uppercase tracking-[0.2em] text-white/45">{{ stat.label }}</p>
      <i [class]="'pi ' + stat.icon + ' text-sm text-accent/50'"></i>
    </div>
    <p class="mt-4 text-4xl font-semibold text-white">{{ stat.count }}</p>
  </a>
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/dashboard/dashboard.component.ts
git commit -m "feat(admin): make dashboard stat cards clickable links to resource lists"
```

---

## Task 12: Nav Labels — Unify Language to Chinese

**Files:**
- Modify: `src/app/admin/admin-layout/admin-layout.component.ts`

Sidebar shows English labels in an otherwise Chinese UI. Standardise to Chinese.

- [ ] **Step 1: Update `navItems` labels**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/admin-layout/admin-layout.component.ts
git commit -m "style(admin): unify sidebar nav labels to Traditional Chinese"
```

---

## Task 13: Version History — Render JSON as Readable Key-Value Table

**Files:**
- Modify: `src/app/admin/shared/version-history/version-history.component.ts`

Raw JSON in `<pre>` is unreadable for non-technical admins. Replace with a formatted key-value table showing field names and values.

- [ ] **Step 1: Add `toEntries()` helper method to the class**

```typescript
protected toEntries(value: Record<string, unknown>): { key: string; value: string }[] {
  return Object.entries(value).map(([k, v]) => ({
    key: k,
    value: v === null || v === undefined ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v),
  }));
}
```

- [ ] **Step 2: Replace the `<pre>` block in the template**

Replace:

```html
<pre class="overflow-x-auto rounded-2xl bg-black/30 p-4 text-xs text-white/70">{{
  toJson(version.version_data)
}}</pre>
```

With:

```html
<div class="mt-2 overflow-x-auto rounded-xl bg-black/25 text-xs">
  <table class="w-full">
    <tbody>
      @for (entry of toEntries(version.version_data); track entry.key) {
        <tr class="border-b border-white/5 last:border-0">
          <td class="w-40 shrink-0 px-4 py-2 font-mono text-white/40">{{ entry.key }}</td>
          <td class="px-4 py-2 text-white/75 break-all">{{ entry.value }}</td>
        </tr>
      }
    </tbody>
  </table>
</div>
```

- [ ] **Step 3: Remove unused `toJson()` method** (no longer referenced in template)

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/shared/version-history/version-history.component.ts
git commit -m "feat(admin): replace raw JSON pre block with readable key-value table in version history"
```

---

## Final Verification

- [ ] Run production build: `cd /Users/seitumbp2025/axia && npx ng build --configuration=production 2>&1 | tail -20`
- [ ] Confirm no TypeScript errors
- [ ] Manually check: login page, dashboard (stat cards link), sidebar mobile, resource list (touch targets), save flow (toast), audit log (pagination), version history (table + ConfirmDialog)
