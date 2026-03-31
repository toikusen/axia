import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'information',
    loadComponent: () => import('./pages/information/information-list/information-list.component').then(m => m.InformationListComponent)
  },
  {
    path: 'information/:id',
    loadComponent: () => import('./pages/information/information-detail/information-detail.component').then(m => m.InformationDetailComponent)
  },
  {
    path: 'schedule',
    loadComponent: () => import('./pages/schedule/schedule.component').then(m => m.ScheduleComponent)
  },
  {
    path: 'member',
    loadComponent: () => import('./pages/member/member-list/member-list.component').then(m => m.MemberListComponent)
  },
  {
    path: 'member/:id',
    loadComponent: () => import('./pages/member/member-detail/member-detail.component').then(m => m.MemberDetailComponent)
  },
  {
    path: 'video',
    loadComponent: () => import('./pages/video/video.component').then(m => m.VideoComponent)
  },
  {
    path: 'discography',
    loadComponent: () => import('./pages/discography/discography.component').then(m => m.DiscographyComponent)
  },
  {
    path: 'goods',
    loadComponent: () => import('./pages/goods/goods.component').then(m => m.GoodsComponent)
  },
  {
    path: 'rules',
    loadComponent: () => import('./pages/rules/rules.component').then(m => m.RulesComponent)
  },
  {
    path: 'rules/:slug',
    loadComponent: () => import('./pages/rules/rules.component').then(m => m.RulesComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  // FAN CLUB reserved for future
  // { path: 'fanclub', loadComponent: ... },
  { path: '**', redirectTo: '' }
];
