import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { combineLatest, Subscription } from 'rxjs';
import {
  ButtonDirective,
  ButtonGroupComponent,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilPlus, cilCopy, cilPen, cilTrash } from '@coreui/icons';

import { FeeApiService } from '../../../services/fee-api.service';
import { FeeGetModel } from '../../../models/fee/get/fee-get.model';
import { FeeModalityEnum } from '../../../models/fee/enum/fee-modality.enum';
import { EmptyDataComponent } from '../../../../../shared/components/empty-data/empty-data.component';
import { FeeCreateModalComponent } from './fee-create-modal/fee-create-modal.component';
import { CopyFeesToModalComponent } from './copy-fees-to-modal/copy-fees-to-modal.component';
import { CopyFeesFromModalComponent } from './copy-fees-from-modal/copy-fees-from-modal.component';
import { FeeEditModalComponent } from './fee-edit-modal/fee-edit-modal.component';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-unit-fees-tab',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ButtonDirective,
    ButtonGroupComponent,
    ColComponent,
    DropdownComponent,
    DropdownItemDirective,
    DropdownMenuDirective,
    DropdownToggleDirective,
    RowComponent,
    SpinnerComponent,
    TableDirective,
    IconDirective,
    EmptyDataComponent
  ],
  templateUrl: './unit-fees-tab.component.html',
  styleUrl: './unit-fees-tab.component.scss',
  providers: [BsModalService]
})
export class UnitFeesTabComponent implements OnInit, OnDestroy {

  icons = { cilPlus, cilCopy, cilPen, cilTrash };

  unitId!: string;
  fees: FeeGetModel[] = [];
  isLoading = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly feeApiService: FeeApiService,
    private readonly toastrService: ToastrService,
    private readonly modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      combineLatest(
        this.activatedRoute.pathFromRoot.map(route => route.paramMap)
      ).subscribe(paramMaps => {
        const unitId = paramMaps
          .map(paramMap => paramMap.get('unitId'))
          .find(id => id !== null);
        if (unitId) {
          this.unitId = unitId;
          this.loadFees();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Load fees for the current unit
   */
  loadFees(): void {
    this.isLoading = true;

    this.subscriptions.push(
      this.feeApiService.getFeesByUnitId(this.unitId, this.currentPage, this.pageSize)
        .subscribe({
          next: (response) => {
            this.fees = response.content;
            this.totalElements = response.totalElements;
            this.totalPages = response.totalPages;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading fees:', error);
            this.toastrService.error(
              'An error occurred while loading fees',
              'Loading Error'
            );
            this.isLoading = false;
          }
        })
    );
  }

  /**
   * Open fee creation modal
   */
  openFeeCreateModal(): void {
    const initialState = {
      unitId: this.unitId
    };

    const modalRef = this.modalService.show(FeeCreateModalComponent, {
      initialState,
      class: 'modal-lg' // Use large modal size
    });

    this.subscriptions.push(
      (modalRef.content as FeeCreateModalComponent).actionConfirmed.subscribe((createdFee) => {
        this.loadFees(); // Reload the list
      })
    );
  }

  /**
   * Open copy fees from modal
   */
  openCopyFromModal(): void {
    const initialState = {
      targetUnitId: this.unitId
    };

    const modalRef = this.modalService.show(CopyFeesFromModalComponent, {
      initialState,
      class: 'modal-xl' // Use extra large modal size
    });

    this.subscriptions.push(
      (modalRef.content as CopyFeesFromModalComponent).actionConfirmed.subscribe(() => {
        this.loadFees(); // Reload the list
      })
    );
  }

  /**
   * Open copy fees to modal
   */
  openCopyToModal(): void {
    const initialState = {
      sourceUnitId: this.unitId
    };

    const modalRef = this.modalService.show(CopyFeesToModalComponent, {
      initialState,
      class: 'modal-xl' // Use extra large modal size
    });

    this.subscriptions.push(
      (modalRef.content as CopyFeesToModalComponent).actionConfirmed.subscribe(() => {
        // Optional: Show success message or perform any other action
        console.log('Fees copied to other units successfully');
      })
    );
  }

  /**
   * Edit fee
   */
  editFee(fee: FeeGetModel): void {
    const initialState = {
      feeToEdit: fee
    };

    const modalRef = this.modalService.show(FeeEditModalComponent, {
      initialState,
      class: 'modal-lg' // Use large modal size
    });

    this.subscriptions.push(
      (modalRef.content as FeeEditModalComponent).actionConfirmed.subscribe((updatedFee) => {
        this.loadFees(); // Reload the list
      })
    );
  }

  /**
   * Delete fee
   */
  deleteFee(fee: FeeGetModel): void {
    const initialState = {
      title: 'Delete Fee',
      message: `Are you sure you want to delete the fee "${fee.name}"? This action cannot be undone.`
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, { initialState });

    this.subscriptions.push(
      (confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
        this.performDeleteFee(fee);
      })
    );
  }

  /**
   * Perform the actual fee deletion
   */
  private performDeleteFee(fee: FeeGetModel): void {
    this.subscriptions.push(
      this.feeApiService.deleteFee(fee.id).subscribe({
        next: () => {
          this.loadFees(); // Reload the list
          this.toastrService.success(
            `Fee "${fee.name}" has been successfully deleted`,
            'Fee Deleted'
          );
        },
        error: (error) => {
          console.error('Error deleting fee:', error);

          const errorMessage = error?.error?.detail ||
            'An error occurred while deleting the fee. Please try again.';

          this.toastrService.error(errorMessage, 'Delete Failed');
        }
      })
    );
  }

  /**
   * Get modality display label
   */
  getModalityLabel(modality: FeeModalityEnum): string {
    const modalityLabels: { [key in FeeModalityEnum]: string } = {
      [FeeModalityEnum.PER_STAY]: 'Per Stay',
      [FeeModalityEnum.PER_NIGHT]: 'Per Night',
      [FeeModalityEnum.PER_PERSON]: 'Per Person',
      [FeeModalityEnum.PER_PERSON_PER_NIGHT]: 'PP/PN'
    };
    return modalityLabels[modality] || modality;
  }
}
