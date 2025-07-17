import { Component } from '@angular/core';
import {
  ButtonDirective,
  ColComponent,
  RowComponent,
  SpinnerComponent,
  FormControlDirective,
  InputGroupComponent, InputGroupTextDirective
} from '@coreui/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import { EmptyDataComponent } from '../../../../../../../shared/components/empty-data/empty-data.component';
import { ListContentComponent } from '../../../../../../../shared/components/list-content/list-content.component';

import { cilSearch, cilPen, cilTrash, cilSwapVertical, cilSortAscending, cilSortDescending } from '@coreui/icons';
import { RateApiService } from '../../../../../services/rate-api.service';
import { UnitRatePlansCreateModalComponent } from '../unit-rate-plans-create-modal/unit-rate-plans-create-modal.component';
import {RatePlanGetModel} from '../../../../../models/rate/get/rate-plan-get.model';
import {NgForOf} from '@angular/common';
import {IconDirective} from '@coreui/icons-angular';

@Component({
  selector: 'app-unit-rate-plans-list',
  standalone: true,
  imports: [
    ButtonDirective,
    ColComponent,
    RowComponent,
    TranslatePipe,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    SpinnerComponent,
    EmptyDataComponent,
    NgForOf,
  ],
  templateUrl: './unit-rate-plans-list.component.html',
  styleUrl: './unit-rate-plans-list.component.scss',
  providers: [BsModalService]
})
export class UnitRatePlansListComponent extends ListContentComponent {

  icons = {
    cilSearch,
    cilPen,
    cilTrash,
    cilSwapVertical,
    cilSortAscending,
    cilSortDescending
  };

  override listContent: RatePlanGetModel[] = [];
  unitId!: string;

  expandedPlans: Set<string> = new Set();

  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(name|enabled|createdAt|modifiedAt),(asc|desc)$/,
    search: /.{3,}/
  };

  constructor(
    public override router: Router,
    public override route: ActivatedRoute,
    public readonly modalService: BsModalService,
    private readonly rateService: RateApiService,
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService
  ) {
    super(router, route);
  }

  override ngOnInit(): void {
    this.unitId = this.route.parent?.parent?.parent?.snapshot.params['unitId'];
    super.ngOnInit();
    this.sort = 'modifiedAt';
    this.sortDirection = 'desc';
    this.size = 10;
    this.subscribeToQueryParam();
  }

  override retrieveListContent(params: any): void {
    super.retrieveListContent(params);

    this.subscriptions.push(
      this.rateService.getRatePlansByPage(this.unitId, this.page, this.size, this.sort, this.sortDirection, this.search)
        .subscribe({
          next: (data) => {
            super.handleSuccessData(data);
          },
          error: (err) => {
            console.error('Error loading rate plans:', err);
            this.toastr.error(
              this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.list.notifications.error.message'),
              this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.list.notifications.error.title')
            );
          }
        })
    );
  }

  openCreateModal(): void {
    const modalRef = this.modalService.show(UnitRatePlansCreateModalComponent, {
      class: 'modal-lg',
      initialState: {
        unitId: this.unitId
      }
    });

    this.subscriptions.push(
      (modalRef.content as UnitRatePlansCreateModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }

  toggleExpanded(id: string): void {
    if (this.expandedPlans.has(id)) {
      this.expandedPlans.delete(id);
    } else {
      this.expandedPlans.add(id);
    }
  }

}
