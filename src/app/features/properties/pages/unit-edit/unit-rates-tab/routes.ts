import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Rates'
    },
    children: [
      {
        path: '',
        redirectTo: 'default',
        pathMatch: 'full',
      },
      {
        path: 'default',
        loadComponent: () => import('./unit-default-rate/unit-default-rate.component').then(m => m.UnitDefaultRateComponent),
        data: {
          title: 'Default'
        }
      },
      {
        path: 'plans',
        loadComponent: () => import('./unit-rate-plans/unit-rate-plans-list/unit-rate-plans-list.component').then(m => m.UnitRatePlansListComponent),
        data: {
          title: 'Plans'
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
