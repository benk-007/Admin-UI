import { Component } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {SegmentListComponent} from './segment-list/segment-list.component';

@Component({
  selector: 'app-crm-settings-tab',
  imports: [
    TranslatePipe,
    SegmentListComponent
  ],
  templateUrl: './crm-settings-tab.component.html',
  styleUrl: './crm-settings-tab.component.scss'
})
export class CrmSettingsTabComponent {

}
