# Rich Text Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all `textarea` and `richtext` admin form fields with PrimeNG's `p-editor` WYSIWYG so non-technical operators can edit content without writing HTML.

**Architecture:** Install Quill as a peer dependency, wire its CSS into `angular.json`, then update `resource-form.component.ts` to render `<p-editor>` for both `richtext` and `textarea` field types. Change six field definitions in `resource-registry.ts` from `textarea` to `richtext`.

**Tech Stack:** Angular 19, PrimeNG 19 `p-editor`, Quill 2.x, Tailwind CSS

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `angular.json` | Modify | Add Quill CSS to `styles` array; bump initial bundle warning budget |
| `src/app/admin/shared/resource-form/resource-form.component.ts` | Modify | Import `EditorModule`; replace `@case ('textarea')` and `@case ('richtext')` templates with `<p-editor>` |
| `src/app/admin/shared/resource-registry.ts` | Modify | Change `type: 'textarea'` → `type: 'richtext'` for `schedule.notes`, `member.bio`, `video.description`, `goods.description` |
| `src/app/admin/shared/resource-form/resource-form.component.spec.ts` | Create | Smoke test: richtext field renders `p-editor`, textarea field also renders `p-editor` |

---

## Task 1: Install Quill and update angular.json

**Files:**
- Modify: `angular.json` (lines 34–36 styles array, lines 46–51 budgets)

- [ ] **Step 1: Install quill**

```bash
npm install quill
```

Expected output: `added 1 package` (or similar). No compile errors.

- [ ] **Step 2: Add Quill CSS to angular.json styles**

In `angular.json`, find `"styles": ["src/styles.css"]` and replace with:

```json
"styles": [
  "node_modules/quill/dist/quill.snow.css",
  "src/styles.css"
]
```

- [ ] **Step 3: Bump initial bundle warning budget**

Quill adds ~350 KB to the initial bundle. In `angular.json` under `configurations.production.budgets`, change the `initial` entry:

```json
{
  "type": "initial",
  "maximumWarning": "1MB",
  "maximumError": "2MB"
}
```

- [ ] **Step 4: Verify build still compiles**

```bash
ng build --configuration=production 2>&1 | tail -20
```

Expected: build succeeds, no errors. A bundle-size warning is acceptable at this point.

- [ ] **Step 5: Commit**

```bash
git add angular.json package.json package-lock.json
git commit -m "chore: install quill and update angular.json for p-editor"
```

---

## Task 2: Update resource-registry — switch textarea fields to richtext

**Files:**
- Modify: `src/app/admin/shared/resource-registry.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/admin/shared/resource-registry.spec.ts`:

```typescript
import { getAdminResourceConfig } from './resource-registry';

describe('resource-registry field types', () => {
  it('member.bio should be richtext', () => {
    const config = getAdminResourceConfig('member');
    const field = config.fields.find(f => f.key === 'bio');
    expect(field?.type).toBe('richtext');
  });

  it('schedule.notes should be richtext', () => {
    const config = getAdminResourceConfig('schedule');
    const field = config.fields.find(f => f.key === 'notes');
    expect(field?.type).toBe('richtext');
  });

  it('video.description should be richtext', () => {
    const config = getAdminResourceConfig('video');
    const field = config.fields.find(f => f.key === 'description');
    expect(field?.type).toBe('richtext');
  });

  it('goods.description should be richtext', () => {
    const config = getAdminResourceConfig('goods');
    const field = config.fields.find(f => f.key === 'description');
    expect(field?.type).toBe('richtext');
  });

  it('information.content_rich_text should be richtext', () => {
    const config = getAdminResourceConfig('information');
    const field = config.fields.find(f => f.key === 'content_rich_text');
    expect(field?.type).toBe('richtext');
  });

  it('rules.content_rich_text should be richtext', () => {
    const config = getAdminResourceConfig('rules');
    const field = config.fields.find(f => f.key === 'content_rich_text');
    expect(field?.type).toBe('richtext');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
ng test --include='**/resource-registry.spec.ts' --watch=false 2>&1 | tail -20
```

Expected: 4 failures for `bio`, `notes`, `description` (×2) still being `textarea`.

- [ ] **Step 3: Change textarea fields to richtext in resource-registry.ts**

In `src/app/admin/shared/resource-registry.ts`:

Find `schedule.fields` entry for `notes` and change its type:
```typescript
{ key: 'notes', label: '備註', type: 'richtext', span: 2, rows: 6 },
```

Find `member.fields` entry for `bio` and change its type:
```typescript
{ key: 'bio', label: '簡介', type: 'richtext', span: 2, rows: 8 },
```

Find `video.fields` entry for `description` and change its type:
```typescript
{ key: 'description', label: '描述', type: 'richtext', span: 2, rows: 6 },
```

Find `goods.fields` entry for `description` and change its type:
```typescript
{ key: 'description', label: '描述', type: 'richtext', span: 2, rows: 6 },
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
ng test --include='**/resource-registry.spec.ts' --watch=false 2>&1 | tail -20
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/shared/resource-registry.ts src/app/admin/shared/resource-registry.spec.ts
git commit -m "feat(admin): change textarea fields to richtext type in resource-registry"
```

---

## Task 3: Update resource-form — render p-editor for richtext fields

**Files:**
- Modify: `src/app/admin/shared/resource-form/resource-form.component.ts`

- [ ] **Step 1: Add EditorModule import**

In `resource-form.component.ts`, add `EditorModule` to the imports list:

```typescript
import { EditorModule } from 'primeng/editor';
```

And add it to the component `imports` array (alongside existing PrimeNG modules):

```typescript
imports: [
  CommonModule,
  NgClass,
  ReactiveFormsModule,
  RouterModule,
  ButtonModule,
  DatePickerModule,
  EditorModule,
  InputTextModule,
  SelectModule,
  TextareaModule,
  ToggleSwitchModule,
  ImageUploadComponent,
  JsonMapInputComponent,
],
```

- [ ] **Step 2: Replace richtext case with p-editor**

Find the `@case ('richtext')` block in the template (lines 84–93) and replace it entirely:

```html
@case ('richtext') {
  <p-editor
    [formControlName]="field.key"
    [style]="{ height: (field.rows ?? 6) * 28 + 'px' }"
    styleClass="w-full"
  >
    <ng-template pTemplate="header">
      <span class="ql-formats">
        <select class="ql-header">
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option selected>Normal</option>
        </select>
      </span>
      <span class="ql-formats">
        <button class="ql-bold" type="button"></button>
        <button class="ql-italic" type="button"></button>
        <button class="ql-underline" type="button"></button>
        <button class="ql-strike" type="button"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-list" value="ordered" type="button"></button>
        <button class="ql-list" value="bullet" type="button"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-blockquote" type="button"></button>
        <button class="ql-link" type="button"></button>
      </span>
      <span class="ql-formats">
        <select class="ql-align"></select>
      </span>
      <span class="ql-formats">
        <button class="ql-clean" type="button"></button>
      </span>
    </ng-template>
  </p-editor>
}
```

- [ ] **Step 3: Remove the HTML hint text for richtext**

Find and remove lines 172–174 (the `@if (field.type === 'richtext')` hint block):

```html
@if (field.type === 'richtext') {
  <p class="text-xs text-white/45">目前以 HTML 文字編輯模式輸入，後續可切換為 Quill 富文字編輯器。</p>
}
```

Delete those 3 lines entirely.

- [ ] **Step 4: Replace textarea case with p-editor**

Find the `@case ('textarea')` block (lines 74–83) and replace it with the same `<p-editor>` markup:

```html
@case ('textarea') {
  <p-editor
    [formControlName]="field.key"
    [style]="{ height: (field.rows ?? 6) * 28 + 'px' }"
    styleClass="w-full"
  >
    <ng-template pTemplate="header">
      <span class="ql-formats">
        <select class="ql-header">
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option selected>Normal</option>
        </select>
      </span>
      <span class="ql-formats">
        <button class="ql-bold" type="button"></button>
        <button class="ql-italic" type="button"></button>
        <button class="ql-underline" type="button"></button>
        <button class="ql-strike" type="button"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-list" value="ordered" type="button"></button>
        <button class="ql-list" value="bullet" type="button"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-blockquote" type="button"></button>
        <button class="ql-link" type="button"></button>
      </span>
      <span class="ql-formats">
        <select class="ql-align"></select>
      </span>
      <span class="ql-formats">
        <button class="ql-clean" type="button"></button>
      </span>
    </ng-template>
  </p-editor>
}
```

- [ ] **Step 5: Verify build compiles without errors**

```bash
ng build 2>&1 | tail -20
```

Expected: build succeeds. No TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/shared/resource-form/resource-form.component.ts
git commit -m "feat(admin): replace textarea/richtext fields with p-editor WYSIWYG"
```

---

## Task 4: Smoke test the component

**Files:**
- Create: `src/app/admin/shared/resource-form/resource-form.component.spec.ts`

> Note: `ResourceFormComponent` requires `ActivatedRoute` with `data.resourceKey` and `paramMap`. The test below uses a minimal stub to verify rendering without spinning up full routing.

- [ ] **Step 1: Write the component smoke test**

Create `src/app/admin/shared/resource-form/resource-form.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ResourceFormComponent } from './resource-form.component';

describe('ResourceFormComponent — richtext rendering', () => {
  let fixture: ComponentFixture<ResourceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceFormComponent],
      providers: [
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { resourceKey: 'schedule' },
              paramMap: { get: () => null },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceFormComponent);
    fixture.detectChanges();
  });

  it('should render p-editor for richtext fields', () => {
    const editors = fixture.nativeElement.querySelectorAll('p-editor');
    expect(editors.length).toBeGreaterThan(0);
  });

  it('should not render a plain textarea for any field', () => {
    const textareas = fixture.nativeElement.querySelectorAll('textarea.admin-textarea');
    expect(textareas.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run all tests**

```bash
ng test --watch=false 2>&1 | tail -30
```

Expected: all tests pass including the new spec.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/shared/resource-form/resource-form.component.spec.ts
git commit -m "test(admin): add smoke test for p-editor rendering in resource-form"
```

---

## Task 5: Manual verification

- [ ] **Step 1: Start dev server**

```bash
ng serve
```

- [ ] **Step 2: Verify each resource form shows the editor**

Open each admin form page and confirm the WYSIWYG toolbar appears:

| URL | Field to check |
|-----|---------------|
| `http://localhost:4200/admin/information/new` | 內容 |
| `http://localhost:4200/admin/rules/new` | 內容 |
| `http://localhost:4200/admin/schedule/new` | 備註 |
| `http://localhost:4200/admin/member/new` | 簡介 |
| `http://localhost:4200/admin/video/new` | 描述 |
| `http://localhost:4200/admin/goods/new` | 描述 |

- [ ] **Step 3: Test round-trip save**

On any resource form:
1. Type formatted text (bold, bullet list, heading)
2. Click 儲存
3. Reopen the record
4. Confirm the formatting is preserved

- [ ] **Step 4: Final commit (if any style fixes needed)**

```bash
git add -A
git commit -m "fix(admin): adjust p-editor styles for admin theme"
```
