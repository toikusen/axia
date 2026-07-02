import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: '',
    title: 'AXIA｜台灣地下偶像團體 官方網站',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'information',
    title: '最新消息｜AXIA',
    loadComponent: () => import('./pages/information/information-list/information-list.component').then(m => m.InformationListComponent)
  },
  {
    path: 'information/:id',
    title: '最新消息｜AXIA',
    loadComponent: () => import('./pages/information/information-detail/information-detail.component').then(m => m.InformationDetailComponent)
  },
  {
    path: 'schedule',
    title: '演出行程｜AXIA',
    loadComponent: () => import('./pages/schedule/schedule.component').then(m => m.ScheduleComponent)
  },
  {
    path: 'member',
    title: '成員介紹｜AXIA',
    loadComponent: () => import('./pages/member/member-list/member-list.component').then(m => m.MemberListComponent)
  },
  {
    path: 'member/:id',
    title: '成員介紹｜AXIA',
    loadComponent: () => import('./pages/member/member-detail/member-detail.component').then(m => m.MemberDetailComponent)
  },
  {
    path: 'video',
    title: '影像作品｜AXIA',
    loadComponent: () => import('./pages/video/video.component').then(m => m.VideoComponent)
  },
  {
    path: 'discography',
    title: '音樂作品｜AXIA',
    loadComponent: () => import('./pages/discography/discography.component').then(m => m.DiscographyComponent)
  },
  {
    path: 'goods',
    title: '周邊商品｜AXIA',
    loadComponent: () => import('./pages/goods/goods.component').then(m => m.GoodsComponent)
  },
  {
    path: 'rules',
    title: '應援規則｜AXIA',
    loadComponent: () => import('./pages/rules/rules.component').then(m => m.RulesComponent)
  },
  {
    path: 'rules/:slug',
    title: '應援規則｜AXIA',
    loadComponent: () => import('./pages/rules/rules.component').then(m => m.RulesComponent)
  },
  {
    path: 'contact',
    title: '聯絡我們｜AXIA',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  // FAN CLUB reserved for future
  // { path: 'fanclub', loadComponent: ... },
  { path: '**', redirectTo: '' }
];
