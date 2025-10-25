import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent)
  },
  {
    path: 'beneficios',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/beneficios/beneficios-list/beneficios-list.component').then(c => c.BeneficiosListComponent)
      },
      {
        path: 'novo',
        loadComponent: () => import('./features/beneficios/beneficio-form/beneficio-form.component').then(c => c.BeneficioFormComponent)
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./features/beneficios/beneficio-form/beneficio-form.component').then(c => c.BeneficioFormComponent)
      },
      {
        path: 'visualizar/:id',
        loadComponent: () => import('./features/beneficios/beneficio-detail/beneficio-detail.component').then(c => c.BeneficioDetailComponent)
      }
    ]
  },
  {
    path: 'transferencias',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/transferencias/transferencia-list/transferencia-list.component').then(c => c.TransferenciaListComponent)
      },
      {
        path: 'nova',
        loadComponent: () => import('./features/transferencias/transferencia-form/transferencia-form.component').then(c => c.TransferenciaFormComponent)
      },
      {
        path: 'visualizar/:id',
        loadComponent: () => import('./features/transferencias/transferencia-detail/transferencia-detail.component').then(c => c.TransferenciaDetailComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];