import { Component } from '@angular/core';
import {PageTitleComponent} from '../../../../shared/components/page-title/page-title.component';
import {TranslatePipe} from '@ngx-translate/core';
import {
  ColComponent,
  ListGroupDirective,
  ListGroupItemDirective,
  NavLinkDirective,
  RowComponent
} from '@coreui/angular';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-setting-tabs',
  imports: [
    PageTitleComponent,
    TranslatePipe,
    RowComponent,
    ColComponent,
    RouterOutlet,
    ListGroupDirective,
    ListGroupItemDirective,
    NavLinkDirective,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './setting-tabs.component.html',
  styleUrl: './setting-tabs.component.scss'
})
export class SettingTabsComponent {

}
