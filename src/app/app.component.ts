import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    @if (!isAdminRoute()) {
      <app-navbar />
    }

    <main [class.pt-16]="!isAdminRoute()" class="min-h-screen">
      <router-outlet />
    </main>

    @if (!isAdminRoute()) {
      <app-footer />
    }
  `,
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null)
    )
  );

  protected readonly isAdminRoute = computed(() => {
    this.navigationEnd();
    return this.router.url.startsWith('/admin');
  });
}
