import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-modern.component').then(c => c.DashboardModernComponent)
  },
  {
    path: 'beneficios',
    loadChildren: () => import('./features/beneficios/beneficios.routes').then(m => m.BENEFICIOS_ROUTES)
  },
  {
    path: 'transferencias',
    loadChildren: () => import('./features/transferencias/transferencias.routes').then(m => m.TRANSFERENCIAS_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];