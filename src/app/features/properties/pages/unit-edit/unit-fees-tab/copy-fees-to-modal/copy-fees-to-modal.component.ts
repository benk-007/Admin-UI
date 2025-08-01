import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import {
  AvatarComponent,
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilSearch, cilBed, cilBath } from '@coreui/icons';

import { FeeApiService } from '../../../../services/fee-api.service';
import { UnitApiService } from '../../../../services/unit-api.service';
import { FeeGetModel } from '../../../../models/fee/get/fee-get.model';
import { UnitItemGetModel } from '../../../../models/unit/get/unit-item-get.model';
import { FeeTypeEnum } from '../../../../models/fee/enum/fee-type.enum';
import { FeeModalityEnum } from '../../../../models/fee/enum/fee-modality.enum';
import {SelectableTableDirective} from '../../../../../../shared/directives/selectable-table.directive';
import {EmptyDataComponent} from '../../../../../../shared/components/empty-data/empty-data.component';
import {UnitSelectComponent} from '../../../../../../shared/components/unit-select/unit-select.component';
import {PageFilterModel} from '../../../../../../shared/models/page-filter.model';
import {UtilsService} from '../../../../../../shared/services/utils.service';


@Component({
  selector: 'app-copy-fees-to-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    ButtonDirective,
    ColComponent,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    RowComponent,
    SpinnerComponent,
    TableDirective,
    IconDirective,
    AvatarComponent,
    EmptyDataComponent,
    UnitSelectComponent,
    SelectableTableDirective
  ],
  templateUrl: './copy-fees-to-modal.component.html',
  styleUrl: './copy-fees-to-modal.component.scss'
})
export class CopyFeesToModalComponent implements OnInit, OnDestroy {

  @Input() sourceUnitId!: string;
  @Output() actionConfirmed = new EventEmitter<void>();

  icons = { cilSearch, cilBed, cilBath };

  // Wizard state
  currentStep: 1 | 2 = 1;
  isSubmitting = false;
  actionType: 'copy' | 'overwrite' | null = null;

  // Step 1: Fees selection
  fees: FeeGetModel[] = [];
  isLoadingFees = false;
  selectedFeeIds: string[] = [];
  selectedFees: FeeGetModel[] = [];

  // Fees pagination
  currentFeesPage = 0;
  feesPageSize = 10;
  totalFeesElements = 0;
  feesSearchTerm = '';
  feesSearchSubject = new Subject<string>();

  // Step 2: Units selection
  units: UnitItemGetModel[] = [];
  isLoadingUnits = false;
  selectedUnitIds: string[] = [];
  selectedUnits: UnitItemGetModel[] = [];

  // Units pagination
  currentUnitsPage = 0;
  unitsPageSize = 10;
  totalUnitsElements = 0;
  unitsSearchTerm = '';
  unitsSearchSubject = new Subject<string>();

  // Math reference for template
  Math = Math;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly feeApiService: FeeApiService,
    private readonly unitApiService: UnitApiService,
    private readonly modalRef: BsModalRef,
    private readonly toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.setupSearchSubscriptions();
    this.loadFees();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Setup search subscriptions with debounce
   */
  private setupSearchSubscriptions(): void {
    // Fees search
    this.subscriptions.push(
      this.feesSearchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.feesSearchTerm = searchTerm;
        this.currentFeesPage = 0;
        this.loadFees();
      })
    );

    // Units search
    this.subscriptions.push(
      this.unitsSearchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.unitsSearchTerm = searchTerm;
        this.currentUnitsPage = 0;
        this.loadUnits();
      })
    );
  }

  /**
   * Load fees from current unit (exclude the source unit)
   */
  private loadFees(): void {
    this.isLoadingFees = true;

    this.subscriptions.push(
      this.feeApiService.getAllFees(
        this.currentFeesPage,
        this.feesPageSize,
        'name',
        'asc',
        this.feesSearchTerm
      ).subscribe({
        next: (response) => {
          // Filter out fees from the current unit
          this.fees = response.content.filter(fee => fee.unit.id !== this.sourceUnitId);
          this.totalFeesElements = response.totalElements;
          this.isLoadingFees = false;
        },
        error: (error) => {
          console.error('Error loading fees:', error);
          this.toastrService.error('Error loading fees', 'Loading Error');
          this.isLoadingFees = false;
        }
      })
    );
  }

  /**
   * Load units (MULTI_UNIT and single units without parent)
   */
  private loadUnits(): void {
    this.isLoadingUnits = true;

    const pageFilter: PageFilterModel = {
      page: this.currentUnitsPage,
      size: this.unitsPageSize,
      sort: 'name',
      sortDirection: 'asc',
      search: this.unitsSearchTerm,
      advancedSearchFormValue: {
        withParent: false // Only units without parent or MULTI_UNIT
      }
    };

    this.subscriptions.push(
      this.unitApiService.getUnitsByPage(pageFilter).subscribe({
        next: (response) => {
          // Filter out the current unit
          this.units = response.content.filter(unit => unit.id !== this.sourceUnitId);
          this.totalUnitsElements = response.totalElements;
          this.isLoadingUnits = false;
        },
        error: (error) => {
          console.error('Error loading units:', error);
          this.toastrService.error('Error loading units', 'Loading Error');
          this.isLoadingUnits = false;
        }
      })
    );
  }

  /**
   * Handle fees selection change
   */
  onFeesSelectionChange(selectedIndices: string[]): void {
    this.selectedFeeIds = selectedIndices.map(index => this.fees[parseInt(index)].id);
    this.selectedFees = this.fees.filter(fee => this.selectedFeeIds.includes(fee.id));
  }

  /**
   * Handle units selection change
   */
  onUnitsSelectionChange(selectedIndices: string[]): void {
    this.selectedUnitIds = selectedIndices.map(index => this.units[parseInt(index)].id);
    this.selectedUnits = this.units.filter(unit => this.selectedUnitIds.includes(unit.id));
  }

  /**
   * Search fees
   */
  searchFees(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.feesSearchSubject.next(searchTerm);
  }

  /**
   * Search units
   */
  searchUnits(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.unitsSearchSubject.next(searchTerm);
  }

  /**
   * Navigate to next step
   */
  nextStep(): void {
    if (this.currentStep === 1 && this.selectedFeeIds.length > 0) {
      this.currentStep = 2;
      this.loadUnits();
    }
  }

  /**
   * Navigate to previous step
   */
  previousStep(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  /**
   * Copy fees to selected units
   */
  copyFees(overwrite: boolean): void {
    if (this.selectedFeeIds.length === 0 || this.selectedUnitIds.length === 0) {
      return;
    }

    this.isSubmitting = true;
    this.actionType = overwrite ? 'overwrite' : 'copy';

    const payload = {
      feeIds: this.selectedFeeIds,
      unitIds: this.selectedUnitIds
    };

    this.subscriptions.push(
      this.feeApiService.copyFeesToUnits(payload, overwrite).subscribe({
        next: () => {
          this.actionConfirmed.emit();
          this.closeModal();

          const action = overwrite ? 'overwritten' : 'copied';
          const message = `${this.selectedFeeIds.length} fee(s) ${action} to ${this.selectedUnitIds.length} unit(s)`;

          this.toastrService.success(message, 'Fees Copied Successfully');
        },
        error: (error) => {
          console.error('Error copying fees:', error);
          this.isSubmitting = false;
          this.actionType = null;

          const errorMessage = error?.error?.detail ||
            'An error occurred while copying fees. Please try again.';

          this.toastrService.error(errorMessage, 'Copy Failed');
        }
      })
    );
  }

  /**
   * Close modal and reset state
   */
  closeModal(): void {
    if (this.isSubmitting) return;

    this.modalRef.hide();
    this.resetModalState();
  }

  /**
   * Reset modal state
   */
  private resetModalState(): void {
    this.currentStep = 1;
    this.isSubmitting = false;
    this.actionType = null;
    this.selectedFeeIds = [];
    this.selectedFees = [];
    this.selectedUnitIds = [];
    this.selectedUnits = [];
    this.feesSearchTerm = '';
    this.unitsSearchTerm = '';
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

  /**
   * Get type display label
   */
  getTypeLabel(type: FeeTypeEnum): string {
    return type === FeeTypeEnum.FLAT ? 'Flat' : 'Percent';
  }

  /**
   * Get name initials
   */
  getNameInitials(name: string): string {
    return UtilsService.getNameInitials(name);
  }

  /**
   * Get avatar color
   */
  getAvatarColor(name: string): string {
    return UtilsService.getAvatarColor(name);
  }
}
