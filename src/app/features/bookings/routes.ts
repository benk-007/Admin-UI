import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: 'reservations',
    data: {
      title: 'Reservations'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/reservation-list/reservation-list.component').then(m => m.ReservationListComponent),
        data: {
          title: 'List'
        }
      }
    ]
  }
]
