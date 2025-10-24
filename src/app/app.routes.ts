import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
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
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];