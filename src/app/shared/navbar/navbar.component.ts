import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);
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
