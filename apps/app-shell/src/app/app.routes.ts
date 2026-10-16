import { Routes } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { BenchmarkDashboardComponent } from './pages/benchmark/benchmark.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'benchmark',
  },
  {
    path: 'benchmark',
    component: BenchmarkDashboardComponent,
  },
  {
    path: 'crm',
    loadChildren: () =>
      loadRemote<any>('mfe_crm/Routes')
        .then((m) => m.routes)
        .catch((err) => {
          console.warn('Fallback to local CRM mock if remote is offline:', err);
          return [];
        }),
  },
  {
    path: 'cdp',
    loadChildren: () =>
      loadRemote<any>('mfe_cdp/Routes')
        .then((m) => m.routes)
        .catch((err) => {
          console.warn('Fallback to local CDP mock if remote is offline:', err);
          return [];
        }),
  },
  {
    path: '**',
    redirectTo: 'benchmark',
  },
];
