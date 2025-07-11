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
      /*      {
              path: ':unitId/view',
              loadComponent: () => import('./pages/view-unit/view-unit.component').then((m) => m.ViewUnitComponent)
            },
            {
              path: ':unitId',
              loadChildren: () => import('./pages/edit-unit/routes').then((m) => m.routes)
            }*/
    ]
  }
]
