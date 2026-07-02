import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { unsavedChangesGuard } from './shared/unsaved-changes.guard';
import { adminPrimeNGProviders } from './primeng.providers';

export const adminRoutes: Routes = [
  {
    path: '',
    providers: adminPrimeNGProviders,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
        data: { title: 'Login' },
      },
      {
        path: '',
        loadComponent: () => import('./admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [authGuard],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          {
            path: 'dashboard',
            loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
            data: { title: 'Dashboard' },
          },
          {
            path: 'information',
            loadComponent: () => import('./shared/resource-list/resource-list.component').then(m => m.ResourceListComponent),
            data: { title: 'Information', resourceKey: 'information' },
          },
          {
            path: 'information/new',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'New Information', resourceKey: 'information' },
          },
          {
            path: 'information/:id',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'Edit Information', resourceKey: 'information' },
          },
          {
            path: 'schedule',
            loadComponent: () => import('./shared/resource-list/resource-list.component').then(m => m.ResourceListComponent),
            data: { title: 'Schedule', resourceKey: 'schedule' },
          },
          {
            path: 'schedule/new',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'New Schedule', resourceKey: 'schedule' },
          },
          {
            path: 'schedule/:id',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'Edit Schedule', resourceKey: 'schedule' },
          },
          {
            path: 'member',
            loadComponent: () => import('./shared/resource-list/resource-list.component').then(m => m.ResourceListComponent),
            data: { title: 'Member', resourceKey: 'member' },
          },
          {
            path: 'member/new',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'New Member', resourceKey: 'member' },
          },
          {
            path: 'member/:id',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'Edit Member', resourceKey: 'member' },
          },
          {
            path: 'video',
            loadComponent: () => import('./shared/resource-list/resource-list.component').then(m => m.ResourceListComponent),
            data: { title: 'Video', resourceKey: 'video' },
          },
          {
            path: 'video/new',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'New Video', resourceKey: 'video' },
          },
          {
            path: 'video/:id',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'Edit Video', resourceKey: 'video' },
          },
          {
            path: 'discography',
            loadComponent: () => import('./shared/resource-list/resource-list.component').then(m => m.ResourceListComponent),
            data: { title: 'Discography', resourceKey: 'discography' },
          },
          {
            path: 'discography/new',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'New Discography', resourceKey: 'discography' },
          },
          {
            path: 'discography/:id',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'Edit Discography', resourceKey: 'discography' },
          },
          {
            path: 'goods',
            loadComponent: () => import('./shared/resource-list/resource-list.component').then(m => m.ResourceListComponent),
            data: { title: 'Goods', resourceKey: 'goods' },
          },
          {
            path: 'goods/new',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'New Goods', resourceKey: 'goods' },
          },
          {
            path: 'goods/:id',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'Edit Goods', resourceKey: 'goods' },
          },
          {
            path: 'rules',
            loadComponent: () => import('./shared/resource-list/resource-list.component').then(m => m.ResourceListComponent),
            data: { title: 'Rules', resourceKey: 'rules' },
          },
          {
            path: 'rules/new',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'New Rules', resourceKey: 'rules' },
          },
          {
            path: 'rules/:id',
            loadComponent: () => import('./shared/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'Edit Rules', resourceKey: 'rules' },
          },
          {
            path: 'contact',
            loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'Contact' },
          },
          {
            path: 'home-settings',
            loadComponent: () => import('./home-settings/home-settings.component').then(m => m.HomeSettingsComponent),
            canDeactivate: [unsavedChangesGuard],
            data: { title: 'Home Settings' },
          },
          {
            path: 'audit-log',
            loadComponent: () => import('./audit-log/audit-log.component').then(m => m.AuditLogComponent),
            data: { title: 'Audit Log' },
          },
        ],
      },
    ],
  },
];
