import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

// PrimeNG (theme, MessageService) is provided at the admin route level — see
// admin/primeng.providers.ts — to keep it out of the public bundle.
// Animations must stay in the root injector: a route-level animation renderer
// leaks the previous page's DOM on every navigation (leave animations never
// flush). provideAnimationsAsync lazy-loads the engine, so the public initial
// bundle stays lean.
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
  ],
};
