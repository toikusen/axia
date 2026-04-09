# Rich Text Editor Integration

**Date:** 2026-04-09  
**Status:** Approved

## Overview

Replace all `textarea` and `richtext` form fields in the admin panel with PrimeNG's built-in `p-editor` (Quill-backed WYSIWYG), so that non-technical operators can edit content without writing HTML.

## Scope

### Fields to upgrade

| Resource | Field | Current type |
|----------|-------|--------------|
| information | `content_rich_text` | richtext |
| rules | `content_rich_text` | richtext |
| schedule | `notes` | textarea |
| member | `bio` | textarea |
| video | `description` | textarea |
| goods | `description` | textarea |

All six fields will use `type: 'richtext'` going forward.

## Architecture

### Library

- **PrimeNG `p-editor`** (`primeng/editor`) — already a project dependency via PrimeNG v19
- Requires **`quill`** as a peer dependency (install separately)
- Supports Angular Reactive Forms `formControlName` natively — no wrapper component needed

### Toolbar Configuration (Standard B)

```
Bold | Italic | Underline | Strike
Header: H1 / H2 / H3
Ordered list | Unordered list
Blockquote
Link
Align: left / center / right
Clear formatting
```

### Changes Required

**1. `src/app/admin/shared/resource-form/resource-form.component.ts`**

- Import `EditorModule` from `primeng/editor`
- Replace `@case ('richtext')` textarea with `<p-editor>` using the toolbar config above
- Replace `@case ('textarea')` textarea with `<p-editor>` using the same toolbar config
- Remove the "目前以 HTML 文字編輯模式" hint text (no longer needed)

**2. `src/app/admin/shared/resource-registry.ts`**

- Change `schedule.notes`, `member.bio`, `video.description`, `goods.description` from `type: 'textarea'` to `type: 'richtext'`

### Data Flow

```
User edits in p-editor → HTML string → FormControl → fromFormValue() → Supabase (text column)
```

Frontend already renders these fields with `[innerHTML]`, so no frontend changes are needed.

**Backwards compatibility:** Existing plain-text values in `bio`/`description`/`notes` columns remain valid — they render correctly under `[innerHTML]` without any migration.

## Installation

```bash
npm install quill
```

Add Quill CSS to `angular.json` → `projects.axia.architect.build.options.styles`:

```json
"node_modules/quill/dist/quill.snow.css"
```

## Out of Scope

- Image upload inside the editor (use the existing dedicated image upload field)
- Markdown support
- Custom fonts or colors in the toolbar
- Frontend rendering changes
