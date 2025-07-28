import {Routes} from "@angular/router";
import {UnitGeneralTabComponent} from './unit-general-tab/unit-general-tab.component';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Units'
    },
    loadComponent: () => import('./unit-tabs/unit-tabs.component').then(m => m.UnitTabsComponent),
    children: [
      {
        path: '',
        redirectTo: 'general',
        pathMatch: 'full',
      },
      {
        path: 'general',
        loadComponent: () => import('./unit-general-tab/unit-general-tab.component').then(m => UnitGeneralTabComponent),
        data: {
          title: 'List'
        }
      },
      {
        path: 'detail',
        loadComponent: () => import('./unit-detail-tab/unit-detail-tab.component').then(m => m.UnitDetailTabComponent),
        data: {
          title: 'Detail Information'
        }
      },
      {
        path: 'rates',
        loadChildren: () => import('./unit-rates-tab/routes').then((m) => m.routes),
        data: {
          title: 'Rates'
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
