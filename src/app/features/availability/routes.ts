import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Availability'
    },
    children: [
      {
        path: '',
        redirectTo: 'create',
        pathMatch: 'full',
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/availability-list/availability-list.component').then(m => m.AvailabilityListComponent),
        data: {
          title: 'Create'
        }
      }
    ]
  }
];
