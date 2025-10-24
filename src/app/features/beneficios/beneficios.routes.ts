import { Routes } from '@angular/router';

export const BENEFICIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./beneficios-list/beneficios-list.component').then(c => c.BeneficiosListComponent),
    title: 'Benefícios'
  },
  {
    path: 'novo',
    loadComponent: () => import('./beneficio-form/beneficio-form.component').then(c => c.BeneficioFormComponent),
    title: 'Novo Benefício'
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./beneficio-form/beneficio-form.component').then(c => c.BeneficioFormComponent),
    title: 'Editar Benefício'
  },
  {
    path: 'detalhes/:id',
    loadComponent: () => import('./beneficio-detail/beneficio-detail.component').then(c => c.BeneficioDetailComponent),
    title: 'Detalhes do Benefício'
  }
];