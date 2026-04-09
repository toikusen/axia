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
      const result = await service.isAdminWhitelisted();
      expect(result).toBeFalse();
    });

    it('returns true when user email is in whitelist', async () => {
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
