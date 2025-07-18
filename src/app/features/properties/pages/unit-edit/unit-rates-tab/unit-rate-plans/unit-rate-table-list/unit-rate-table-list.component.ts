import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';

import { ListContentComponent } from '../../../../../../../shared/components/list-content/list-content.component';
import { RateApiService } from '../../../../../services/rate-api.service';
import {RateTableGetModel} from '../../../../../models/rate/get/rate-table.get.model';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent, SpinnerComponent
} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {cilPen, cilSearch, cilSortAscending, cilSortDescending, cilSwapVertical, cilTrash} from '@coreui/icons';
import {UnitRateTableCuModalComponent} from '../unit-rate-table-cu-modal/unit-rate-table-create-modal.component';
import {EmptyDataComponent} from '../../../../../../../shared/components/empty-data/empty-data.component';


@Component({
  selector: 'app-unit-rate-table-list',
  standalone: true,
  imports: [TranslatePipe, ColComponent, FormControlDirective, IconDirective, InputGroupComponent, InputGroupTextDirective, RowComponent, ButtonDirective, EmptyDataComponent, SpinnerComponent],
  templateUrl: './unit-rate-table-list.component.html',
  styleUrl: './unit-rate-table-list.component.scss',
  providers: [BsModalService]
})
export class UnitRateTableListComponent extends ListContentComponent {
  icons = {
    cilSearch,
    cilPen,
    cilTrash,
    cilSwapVertical,
    cilSortAscending,
    cilSortDescending
  };

  @Input() ratePlanId!: string;

  override listContent: RateTableGetModel[] = [];

  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(name|createdAt|startDate|endDate),(asc|desc)$/,
    search: /.{3,}/
  };

  constructor(
    public override router: Router,
    public override route: ActivatedRoute,
    private readonly rateService: RateApiService,
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService,
    public readonly modalService: BsModalService
  ) {
    super(router, route);
  }

  override ngOnInit(): void {
    this.sort = 'createdAt';
    this.sortDirection = 'asc';
    this.size = 50;
    this.subscribeToQueryParam();
  }

  override retrieveListContent(params: any): void {
    super.retrieveListContent(params);

    this.subscriptions.push(
      this.rateService.getRateTablesByRatePlan(this.ratePlanId, this.page, this.size, this.sort, this.sortDirection, this.search)
        .subscribe({
          next: (data) => {
            super.handleSuccessData(data);
          },
          error: (err) => {
            console.error('Error loading rate tables:', err);
            this.toastr.error(
              this.translateService.instant('units.edit-unit.tabs.rates.rateTable.list.notifications.error.message'),
              this.translateService.instant('units.edit-unit.tabs.rates.rateTable.list.notifications.error.title')
            );
          }
        })
    );
  }

  openRateTableCuModal(ratePlanId: string, rateTableToEdit?: RateTableGetModel): void {
    const modalRef = this.modalService.show(UnitRateTableCuModalComponent, {
      class: 'modal-lg',
      initialState: {
        ratePlanId,
        rateTableToEdit
      }
    });

    this.subscriptions.push(
      (modalRef.content as UnitRateTableCuModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }


}
