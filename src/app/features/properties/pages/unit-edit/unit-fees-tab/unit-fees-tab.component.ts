import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
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
import { UnitFeeFormComponent } from './unit-fee-form/unit-fee-form.component';
import { EmptyDataComponent } from '../../../../../shared/components/empty-data/empty-data.component';

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
    UnitFeeFormComponent,
    EmptyDataComponent
  ],
  templateUrl: './unit-fees-tab.component.html',
  styleUrl: './unit-fees-tab.component.scss'
})
export class UnitFeesTabComponent implements OnInit, OnDestroy {

  icons = { cilPlus, cilCopy, cilPen, cilTrash };

  unitId!: string;
  fees: FeeGetModel[] = [];
  isLoading = false;
  newFees: any[] = []; // Array to hold new fee forms

  // Pagination
  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly feeApiService: FeeApiService,
    private readonly toastrService: ToastrService
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
   * Add a new fee form
   */
  addNewFee(): void {
    const newFee = {
      id: Date.now(), // Temporary ID for tracking
      name: '',
      amount: '',
      type: 'FLAT',
      modality: 'PER_STAY',
      description: '',
      active: true,
      isNew: true
    };
    this.newFees.push(newFee);
  }

  /**
   * Remove a new fee form
   */
  removeNewFee(index: number): void {
    this.newFees.splice(index, 1);
  }

  /**
   * Handle fee creation success
   */
  onFeeCreated(fee: FeeGetModel, index: number): void {
    // Remove the form from newFees array
    this.newFees.splice(index, 1);
    // Reload the list to show the created fee
    this.loadFees();
    this.toastrService.success(
      `Fee "${fee.name}" has been successfully created`,
      'Fee Created'
    );
  }

  /**
   * Handle fee creation error
   */
  onFeeCreationError(index: number): void {
    // Keep the form but show error (handled by child component)
  }

  /**
   * Get modality display label
   */
  getModalityLabel(modality: string): string {
    const modalityLabels: { [key: string]: string } = {
      'PER_STAY': 'Per Stay',
      'PER_NIGHT': 'Per Night',
      'PER_PERSON': 'Per Person',
      'PER_PERSON_PER_NIGHT': 'Per Person/Per Night (PP/PN)'
    };
    return modalityLabels[modality] || modality;
  }

  /**
   * Get type display label
   */
  getTypeLabel(type: string): string {
    return type === 'FLAT' ? 'Flat' : 'Percent';
  }

  /**
   * Open copy fees from modal
   */
  openCopyFromModal(): void {
    // TODO: Implement copy from modal
    console.log('Copy from modal - to be implemented');
  }

  /**
   * Open copy fees to modal
   */
  openCopyToModal(): void {
    // TODO: Implement copy to modal
    console.log('Copy to modal - to be implemented');
  }
}
