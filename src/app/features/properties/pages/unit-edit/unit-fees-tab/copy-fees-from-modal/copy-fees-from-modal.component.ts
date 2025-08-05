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
import { FeeModalityEnum } from '../../../../models/fee/enum/fee-modality.enum';
import {EmptyDataComponent} from '../../../../../../shared/components/empty-data/empty-data.component';
import { SelectableTableDirective } from 'src/app/shared/directives/selectable-table.directive';
import {PageFilterModel} from '../../../../../../shared/models/page-filter.model';
import {UtilsService} from '../../../../../../shared/services/utils.service';


@Component({
  selector: 'app-copy-fees-from-modal',
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
    SelectableTableDirective
  ],
  templateUrl: './copy-fees-from-modal.component.html',
  styleUrl: './copy-fees-from-modal.component.scss'
})
export class CopyFeesFromModalComponent implements OnInit, OnDestroy {

  @Input() targetUnitId!: string;
  @Output() actionConfirmed = new EventEmitter<void>();

  icons = { cilSearch, cilBed, cilBath };

  // Wizard state
  currentStep: 1 | 2 = 1;
  isSubmitting = false;
  actionType: 'copy' | 'overwrite' | null = null;

  // Step 1: Units selection
  units: UnitItemGetModel[] = [];
  isLoadingUnits = false;
  selectedUnitIds: string[] = [];
  selectedUnits: UnitItemGetModel[] = [];

  // Units pagination
  currentUnitsPage = 0;
  unitsPageSize = 5;
  totalUnitsElements = 0;
  unitsSearchTerm = '';
  unitsSearchSubject = new Subject<string>();

  // Step 2: Fees selection from selected units
  fees: FeeGetModel[] = [];
  isLoadingFees = false;
  selectedFeeIds: string[] = [];
  selectedFees: FeeGetModel[] = [];

  // Fees pagination
  currentFeesPage = 0;
  feesPageSize = 5;
  totalFeesElements = 0;
  feesSearchTerm = '';
  feesSearchSubject = new Subject<string>();

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
    this.loadUnits();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Setup search subscriptions with debounce
   */
  private setupSearchSubscriptions(): void {
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

    // Fees search
    this.subscriptions.push(
      this.feesSearchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.feesSearchTerm = searchTerm;
        this.currentFeesPage = 0;
        this.loadFeesFromSelectedUnits();
      })
    );
  }

  /**
   * Load units (MULTI_UNIT and single units without parent, excluding target unit)
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
          // Filter out the target unit
          this.units = response.content.filter(unit => unit.id !== this.targetUnitId);
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
   * Load fees from selected units only
   */
  private loadFeesFromSelectedUnits(): void {
    if (this.selectedUnitIds.length === 0) {
      this.fees = [];
      this.totalFeesElements = 0;
      this.isLoadingFees = false;
      return;
    }

    this.isLoadingFees = true;

    this.subscriptions.push(
      this.feeApiService.getAllFees(
        this.currentFeesPage,
        this.feesPageSize,
        'name',
        'asc',
        this.feesSearchTerm,
        this.selectedUnitIds  // Only fees from selected units
      ).subscribe({
        next: (response) => {
          this.fees = response.content;
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
   * Handle units selection change
   */
  onUnitsSelectionChange(selectedIndices: string[]): void {
    this.selectedUnitIds = selectedIndices.map(index => this.units[parseInt(index)].id);
    this.selectedUnits = this.units.filter(unit => this.selectedUnitIds.includes(unit.id));

    // Reset fees selection when units change
    this.selectedFeeIds = [];
    this.selectedFees = [];
    this.fees = [];
    this.totalFeesElements = 0;
    this.currentFeesPage = 0;
  }

  /**
   * Handle fees selection change
   */
  onFeesSelectionChange(selectedIndices: string[]): void {
    this.selectedFeeIds = selectedIndices.map(index => this.fees[parseInt(index)].id);
    this.selectedFees = this.fees.filter(fee => this.selectedFeeIds.includes(fee.id));
  }

  /**
   * Search units
   */
  searchUnits(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.unitsSearchSubject.next(searchTerm);
  }

  /**
   * Search fees
   */
  searchFees(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.feesSearchSubject.next(searchTerm);
  }

  /**
   * Navigate to next step
   */
  nextStep(): void {
    if (this.currentStep === 1 && this.selectedUnitIds.length > 0) {
      this.currentStep = 2;
      this.loadFeesFromSelectedUnits();
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
   * Copy selected fees to current unit
   */
  copyFeesToCurrentUnit(overwrite: boolean): void {
    if (this.selectedFeeIds.length === 0) {
      return;
    }

    this.isSubmitting = true;
    this.actionType = overwrite ? 'overwrite' : 'copy';

    const payload = {
      feeIds: this.selectedFeeIds,
      unitIds: [this.targetUnitId]
    };

    this.subscriptions.push(
      this.feeApiService.copyFeesToUnits(payload, overwrite).subscribe({
        next: () => {
          this.isSubmitting = false; // Reset loading state
          this.actionConfirmed.emit();
          this.closeModal();

          const action = overwrite ? 'overwritten' : 'copied';
          const message = `${this.selectedFeeIds.length} fee(s) ${action} to current unit`;

          this.toastrService.success(message, 'Fees Copied Successfully');
        },
        error: (error) => {
          console.error('Error copying fees:', error);
          this.isSubmitting = false; // Reset loading state
          this.actionType = null;

          const errorMessage = error?.error?.detail ||
            'An error occurred while copying fees. Please try again.';

          this.toastrService.error(errorMessage, 'Copy Failed');
        }
      })
    );
  }

  /**
   * Get unit name by ID
   */
  getUnitNameById(unitId: string): string {
    const unit = this.selectedUnits.find(u => u.id === unitId);
    return unit ? unit.name : 'Unknown Unit';
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
    this.fees = [];
    this.units = [];
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
