# Admin Google OAuth Design

**Date:** 2026-04-09
**Status:** Approved

## Summary

Replace the admin email/password login with Google OAuth via Supabase Auth. Access is restricted to a whitelist of specific email addresses stored in the database.

## Architecture

```
LoginComponent
  └─ 「使用 Google 登入」按鈕
       └─ supabase.auth.signInWithOAuth({ provider: 'google', redirectTo })
            └─ Google OAuth flow → redirect back to /admin/login
                 └─ Supabase JS auto-exchanges code for session
                      └─ authGuard: session check + whitelist check
                           ├─ pass → navigate to /admin/dashboard
                           └─ fail → signOut → /admin/login?error=unauthorized
```

## Database

New migration `004_admin_whitelist.sql`:

- Table: `admin_whitelist(email text primary key)`
- RLS enabled; authenticated users can SELECT only their own row (`auth.jwt()->>'email' = email`)
- Writes restricted to service role only
- Seed: insert the owner's email at migration time

## Changes

### `auth.service.ts`

- Add `signInWithGoogle()`: calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/admin/login' } })`
- Add `isAdminWhitelisted()`: queries `admin_whitelist` for the current user's email; returns boolean

### `auth.guard.ts`

Current: checks session only.
Updated: checks session → if no session, redirect to login. If session exists, check whitelist → if not whitelisted, call `signOut()` then redirect to `/admin/login?error=unauthorized`.

### `login.component.ts`

- Remove `FormGroup`, email/password fields, `signIn()` method
- Add Google login button that calls `authService.signInWithGoogle()`
- On `ngOnInit`: if session exists and whitelisted → navigate to dashboard; if session exists but not whitelisted → sign out + show error
- Read `error=unauthorized` query param to show access-denied message

## Security Notes

- Whitelist check happens both in `authGuard` (all protected routes) and `login.component.ts ngOnInit` (OAuth callback landing)
- RLS ensures the whitelist table cannot be read in bulk by authenticated users — each user can only confirm their own presence
- Existing content table RLS policies (`to authenticated`) remain unchanged; the whitelist is the sole gate for admin access

## Out of Scope

- Updating content table RLS to reference whitelist (future hardening)
- Multi-admin management UI
- OAuth provider fallback
