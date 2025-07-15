import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: 'units',
    data: {
      title: 'Units'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/unit-list/unit-list.component').then(m => m.UnitListComponent),
        data: {
          title: 'List'
        }
      },
      {
        path: ':unitId',
        loadChildren: () => import('./pages/unit-edit/routes').then((m) => m.routes)
      }
    ]
  }
]
