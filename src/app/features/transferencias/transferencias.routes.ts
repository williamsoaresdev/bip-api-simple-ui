import { Routes } from '@angular/router';

export const TRANSFERENCIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./transferencia-list/transferencia-list.component').then(c => c.TransferenciaListComponent),
    title: 'Transferências'
  },
  {
    path: 'novo',
    loadComponent: () => import('./transferencia-form/transferencia-form.component').then(c => c.TransferenciaFormComponent),
    title: 'Nova Transferência'
  }
];