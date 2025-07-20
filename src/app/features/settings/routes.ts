import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Settings'
    },
    loadComponent: () => import('./pages/setting-tabs/setting-tabs.component').then(m => m.SettingTabsComponent),
    children: [
      {
        path: '',
        redirectTo: 'crm',
        pathMatch: 'full',
      },
      {
        path: 'crm',
        loadComponent: () => import('./pages/crm-settings-tab/crm-settings-tab.component').then(m => m.CrmSettingsTabComponent)
      }
    ]
  }
]
