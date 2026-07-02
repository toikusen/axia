import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

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

  navLinks = [
    { path: '/information', label: 'INFORMATION' },
    { path: '/schedule', label: 'SCHEDULE' },
    { path: '/member', label: 'MEMBER' },
    { path: '/video', label: 'VIDEO' },
    { path: '/discography', label: 'DISCOGRAPHY' },
    { path: '/goods', label: 'GOODS' },
    { path: '/rules', label: 'RULES' },
    { path: '/contact', label: 'CONTACT' },
  ];

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
