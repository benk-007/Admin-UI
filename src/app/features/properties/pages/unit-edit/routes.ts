import {Routes} from "@angular/router";
import {UnitGeneralTabComponent} from './unit-general-tab/unit-general-tab.component';
import {UnitRoomBeddingTabComponent} from './unit-room-bedding-tab/unit-room-bedding-tab.component';
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
        path: 'details',
        loadComponent: () => import('./unit-detail-tab/unit-detail-tab.component').then(m => m.UnitDetailTabComponent),
        data: {
          title: 'Detail Information'
        }
      },
      {
        path: 'bedding-rooms',
        loadComponent: () => import('./unit-room-bedding-tab/unit-room-bedding-tab.component').then(m => UnitRoomBeddingTabComponent),
        data: {
          title: 'List'
        }
      },
      {
        path: 'sub-units',
        loadComponent: () => import('./unit-sub-units-tab/unit-sub-units-tab.component').then(m => m.UnitSubUnitsTabComponent),
        data: {
          title: 'Sub-units'
        }
      },
      {
        path: 'rates',
        loadChildren: () => import('./unit-rates-tab/routes').then((m) => m.routes),
        data: {
          title: 'Rates'
        }
      },
      {
        path: 'fees',
        loadComponent: () => import('./unit-fees-tab/unit-fees-tab.component').then(m => m.UnitFeesTabComponent),
        data: {
          title: 'Fees'
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
