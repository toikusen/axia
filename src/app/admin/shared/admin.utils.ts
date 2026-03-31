import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export function markAllControlsTouched(control: AbstractControl): void {
  control.markAsTouched();

  if (control instanceof FormGroup) {
    Object.values(control.controls).forEach(child => markAllControlsTouched(child));
  }

  if (control instanceof FormArray) {
    control.controls.forEach(child => markAllControlsTouched(child));
  }
}

export function toDateValue(value: unknown): Date | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toIsoDateTime(value: unknown): string | null {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null;
  }

  return value.toISOString();
}

export function toIsoDate(value: unknown): string | null {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null;
  }

  return value.toISOString().slice(0, 10);
}

export function sanitizeStringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, entryValue]) => [key.trim(), String(entryValue ?? '').trim()])
      .filter(([key, entryValue]) => key.length > 0 || entryValue.length > 0)
  );
}

export function sanitizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(tag => String(tag).trim())
      .filter(tag => tag.length > 0);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

export function tagsToInputValue(tags: unknown): string {
  return Array.isArray(tags) ? tags.join(', ') : '';
}

export function formatDateLabel(value: unknown, includeTime = true): string {
  if (!value || typeof value !== 'string') {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('zh-TW', {
    dateStyle: 'medium',
    timeStyle: includeTime ? 'short' : undefined,
  }).format(date);
}
