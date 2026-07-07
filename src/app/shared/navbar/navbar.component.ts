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
