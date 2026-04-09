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
