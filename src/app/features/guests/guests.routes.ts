import { Routes } from '@angular/router';
import {PartyTypeEnum} from './models/enums/party-type.enum';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Guests',
      type: PartyTypeEnum.GUEST
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./pages/guest-list/guest-list.component').then(m => m.GuestListComponent),
        data: {
          title: 'List',
          type: PartyTypeEnum.GUEST
        }
      },
      {
        path: ':id',
        loadChildren: () =>
          import('./pages/guest-edit/routes').then(m => m.routes)
      }
    ]
  }
];
