import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
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
import {FeeApiService} from '../../../../properties/services/fee-api.service';
import {FeeGetModel} from '../../../../properties/models/fee/get/fee-get.model';
import {GenericFeeCreateModalComponent} from '../generic-fee-create-modal/generic-fee-create-modal.component';
import {ConfirmModalComponent} from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import {FeeModalityEnum} from '../../../../properties/models/fee/enum/fee-modality.enum';
import {EmptyDataComponent} from '../../../../../shared/components/empty-data/empty-data.component';



@Component({
  selector: 'app-generic-fee-list',
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
  templateUrl: './generic-fee-list.component.html',
  styleUrl: './generic-fee-list.component.scss',
  providers: [BsModalService]
})
export class GenericFeeListComponent implements OnInit, OnDestroy {

  icons = { cilPlus, cilCopy, cilPen, cilTrash };

  fees: FeeGetModel[] = [];
  isLoading = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly feeApiService: FeeApiService,
    private readonly toastrService: ToastrService,
    private readonly modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.loadGenericFees();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Load generic fees (fees without unitId)
   */
  loadGenericFees(): void {
    this.isLoading = true;

    this.subscriptions.push(
      this.feeApiService.getGenericFees(this.currentPage, this.pageSize)
        .subscribe({
          next: (response) => {
            this.fees = response.content;
            this.totalElements = response.totalElements;
            this.totalPages = response.totalPages;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading generic fees:', error);
            this.toastrService.error(
              'An error occurred while loading generic fees',
              'Loading Error'
            );
            this.isLoading = false;
          }
        })
    );
  }

  /**
   * Open generic fee creation modal
   */
  openGenericFeeCreateModal(): void {
    const modalRef = this.modalService.show(GenericFeeCreateModalComponent, {
      class: 'modal-lg' // Use large modal size
    });

    this.subscriptions.push(
      (modalRef.content as GenericFeeCreateModalComponent).actionConfirmed.subscribe((createdFee) => {
        this.loadGenericFees(); // Reload the list
      })
    );
  }

  /**
   * Edit generic fee
   */
  editGenericFee(fee: FeeGetModel): void {
    const initialState = {
      feeToEdit: fee
    };

    const modalRef = this.modalService.show(GenericFeeEditModalComponent, {
      initialState,
      class: 'modal-lg' // Use large modal size
    });

    this.subscriptions.push(
      (modalRef.content as GenericFeeEditModalComponent).actionConfirmed.subscribe((updatedFee) => {
        this.loadGenericFees(); // Reload the list
      })
    );
  }

  /**
   * Delete generic fee
   */
  deleteGenericFee(fee: FeeGetModel): void {
    const initialState = {
      title: 'Delete Generic Fee',
      message: `Are you sure you want to delete the generic fee "${fee.name}"? This action cannot be undone and will affect all units in this property.`
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, { initialState });

    this.subscriptions.push(
      (confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
        this.performDeleteGenericFee(fee);
      })
    );
  }

  /**
   * Perform the actual generic fee deletion
   */
  private performDeleteGenericFee(fee: FeeGetModel): void {
    this.subscriptions.push(
      this.feeApiService.deleteFee(fee.id).subscribe({
        next: () => {
          this.loadGenericFees(); // Reload the list
          this.toastrService.success(
            `Generic fee "${fee.name}" has been successfully deleted`,
            'Generic Fee Deleted'
          );
        },
        error: (error) => {
          console.error('Error deleting generic fee:', error);

          const errorMessage = error?.error?.detail ||
            'An error occurred while deleting the generic fee. Please try again.';

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
