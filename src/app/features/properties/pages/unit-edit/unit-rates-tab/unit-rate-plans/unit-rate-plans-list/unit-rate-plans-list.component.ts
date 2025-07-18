import { Component } from '@angular/core';
import {
  ButtonDirective,
  ColComponent,
  RowComponent,
  SpinnerComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  AccordionComponent,
  AccordionItemComponent,
  AccordionButtonDirective,
  TemplateIdDirective
} from '@coreui/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import { EmptyDataComponent } from '../../../../../../../shared/components/empty-data/empty-data.component';
import { ListContentComponent } from '../../../../../../../shared/components/list-content/list-content.component';

import { cilSearch, cilPen, cilTrash, cilSwapVertical, cilSortAscending, cilSortDescending } from '@coreui/icons';
import { RateApiService } from '../../../../../services/rate-api.service';
import {  UnitRatePlansCuModalComponent} from '../unit-rate-plans-cu-modal/unit-rate-plans-cu-modal.component';
import {RatePlanGetModel} from '../../../../../models/rate/get/rate-plan-get.model';
import {NgForOf} from '@angular/common';
import {IconDirective} from '@coreui/icons-angular';
import {
  UnitRateTableCreateModalComponent
} from '../unit-rate-table-create-modal/unit-rate-table-create-modal.component';
import {ConfirmModalComponent} from "../../../../../../../shared/components/confirm-modal/confirm-modal.component";
import {TooltipDirective} from "ngx-bootstrap/tooltip";

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
    AccordionComponent,
    AccordionItemComponent,
    AccordionButtonDirective,
    TemplateIdDirective,
    TooltipDirective
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
    this.sort = 'CreatedAt';
    this.sortDirection = 'Asc';
    this.size = 50;
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

  openRatePlanCuModal(ratePlanToEdit?: RatePlanGetModel): void {
    const initialState = ratePlanToEdit
        ? { unitId: this.unitId, ratePlanToEdit }
        : { unitId: this.unitId };

    const modalRef = this.modalService.show(UnitRatePlansCuModalComponent, {
      class: 'modal-lg',
      initialState
    });

    this.subscriptions.push(
        (modalRef.content as UnitRatePlansCuModalComponent).actionConfirmed.subscribe(() => {
          this.refreshListContent();
        })
    );
  }


  openRateTableCreateModal(ratePlanId: string): void {
    const modalRef = this.modalService.show(UnitRateTableCreateModalComponent, {
      class: 'modal-lg',
      initialState: {
        ratePlanId: ratePlanId,
        unitId: this.unitId
      }
    });

    this.subscriptions.push(
      (modalRef.content as UnitRateTableCreateModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }

  deletePlan(plan: RatePlanGetModel): void {
    const initialState = {
      title: this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.delete.modal.title'),
      message: this.translateService.instant(
          'units.edit-unit.tabs.rates.ratesPlans.delete.modal.message',
          { name: plan.name }
      )
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, { initialState });

    this.subscriptions.push(
        (confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
          this.rateService.deleteRatePlan(plan.id).subscribe({
            next: () => {
              this.refreshListContent();
              this.toastr.success(
                  this.translateService.instant(
                      'units.edit-unit.tabs.rates.ratesPlans.delete.notifications.success.message',
                      { name: plan.name }
                  ),
                  this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.delete.notifications.success.title')
              );
            },
            error: () => {
              this.toastr.error(
                  this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.delete.notifications.error.message'),
                  this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.delete.notifications.error.title')
              );
            }
          });
        })
    );
  }

}
