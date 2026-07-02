import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges { hasUnsavedChanges(): boolean; }

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) return true;
  return confirm('尚未儲存的變更將會消失，確定要離開嗎？');
};
