import {Component, OnDestroy} from '@angular/core';
import {UnitGetModel} from '../../../models/unit/get/unit-get.model';
import {Subscription} from 'rxjs';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {UnitApiService} from '../../../services/unit-api.service';
import {UnitNatureEnum} from '../../../models/unit/enums/unit-nature.enum';
import {PageTitleComponent} from '../../../../../shared/components/page-title/page-title.component';
import {TranslatePipe} from '@ngx-translate/core';
import {
  DropdownComponent, DropdownItemDirective, DropdownMenuDirective, DropdownToggleDirective,
  NavComponent, NavItemComponent, NavLinkDirective,
  TabDirective,
  TabPanelComponent,
  TabsComponent,
  TabsContentComponent,
  TabsListComponent
} from '@coreui/angular';

@Component({
  selector: 'app-unit-tabs',
  imports: [
    PageTitleComponent,
    TranslatePipe,
    TabsComponent,
    TabsListComponent,
    TabDirective,
    TabsContentComponent,
    TabPanelComponent,
    RouterOutlet,
    NavComponent,
    NavItemComponent,
    NavLinkDirective,
    RouterLink,
    RouterLinkActive,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective
  ],
  templateUrl: './unit-tabs.component.html',
  styleUrl: './unit-tabs.component.scss'
})
export class UnitTabsComponent implements OnDestroy {

  private component = '[UnitTabsComponent]: ';
  unit!: UnitGetModel;
  private unitId!: string;

  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly activatedRoute: ActivatedRoute, private readonly unitApiService: UnitApiService) {
    this.subscriptions.push(this.activatedRoute.paramMap.subscribe(value => {
      this.unitId = value.get('unitId') as string;
      this.retrieveUnit();
    }));
  }

  get title(): string {
    if (this.unit.nature == UnitNatureEnum.MULTI_UNIT) {
      return 'units.edit-unit.title.multi-unit';
    } else if (this.unit.parent != null) {
      return 'units.edit-unit.title.sub-unit';
    } else {
      return 'units.edit-unit.title.unit';
    }
  }

  private retrieveUnit() {
    this.subscriptions.push(this.unitApiService.getUnitById(this.unitId).subscribe({
      next: (data) => {
        console.info(this.component.concat('Unit retrieved successfully. API response is:'), data);
        this.unit = data;
      },
      error: (err) => {
        console.error(this.component.concat('An error occurred when retrieving unit by Id:'), this.unitId, '. Error API is:', err);
        //TODO: redirect to listing page with an alert message
      }
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }
}
