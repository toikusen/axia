import { normalizeUrl } from './admin.utils';
import { HasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes.guard';

describe('normalizeUrl', () => {
  it('prepends https:// when scheme is missing', () => {
    expect(normalizeUrl('www.instagram.com/axia')).toBe('https://www.instagram.com/axia');
  });

  it('keeps existing http/https scheme', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeUrl('HTTP://example.com')).toBe('HTTP://example.com');
  });

  it('returns null for empty or blank input', () => {
    expect(normalizeUrl('')).toBeNull();
    expect(normalizeUrl('   ')).toBeNull();
    expect(normalizeUrl(null)).toBeNull();
    expect(normalizeUrl(undefined)).toBeNull();
  });
});

describe('unsavedChangesGuard', () => {
  const run = (dirty: boolean) => {
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => dirty };
    return unsavedChangesGuard(component, null as never, null as never, null as never);
  };

  it('allows navigation when there are no unsaved changes', () => {
    expect(run(false)).toBeTrue();
  });

  it('asks for confirmation when there are unsaved changes', () => {
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);
    expect(run(true)).toBeFalse();
    expect(confirmSpy).toHaveBeenCalled();
  });
});
