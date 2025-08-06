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

  // Unit selection for fees (Step 1)
  selectedSourceUnits: UnitItemGetModel[] = [];
  selectedSourceUnitIds: string[] = [];

  // Fees pagination
  currentFeesPage = 0;
  feesPageSize = 5;
  totalFeesElements = 0;
  feesSearchTerm = '';
  feesSearchSubject = new Subject<string>();

  // Step 2: Target units selection
  targetUnits: UnitItemGetModel[] = [];
  isLoadingTargetUnits = false;
  selectedTargetUnitIds: string[] = [];
  selectedTargetUnits: UnitItemGetModel[] = [];

  // Target units pagination
  currentTargetUnitsPage = 0;
  targetUnitsPageSize = 5;
  totalTargetUnitsElements = 0;
  targetUnitsSearchTerm = '';
  targetUnitsSearchSubject = new Subject<string>();

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
    this.initializeWithCurrentUnit();

    // Pre-populate the selectedSourceUnits for the unit-select component
    this.subscriptions.push(
      this.unitApiService.getUnitById(this.sourceUnitId).subscribe({
        next: (unit) => {
          const unitItem: UnitItemGetModel = {
            id: unit.id,
            name: unit.name,
            subtitle: unit.subtitle,
            beds: 0,
            bathrooms: 0,
            audit: unit.audit,
            readiness: unit.readiness,
            nature: unit.nature,
            contact: unit.contact,
            address: unit.address,
            parent: unit.parent,
            priority: 0,
            subUnits: []
          };

          this.selectedSourceUnits = [unitItem];
        },
        error: (error) => {
          console.error('Error loading current unit:', error);
        }
      })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Initialize with current unit selected by default
   */
  private initializeWithCurrentUnit(): void {
    // Set the current unit ID as pre-selected without fetching it again
    // The unit-select component will handle the display
    this.selectedSourceUnitIds = [this.sourceUnitId];
    this.loadFeesFromSelectedUnits();
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
        this.loadFeesFromSelectedUnits();
      })
    );

    // Target units search
    this.subscriptions.push(
      this.targetUnitsSearchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.targetUnitsSearchTerm = searchTerm;
        this.currentTargetUnitsPage = 0;
        this.loadTargetUnits();
      })
    );
  }

  /**
   * Handle unit selection change from unit-select component
   */
  onUnitSelectionChange(selectedUnits: UnitItemGetModel[]): void {
    this.selectedSourceUnits = selectedUnits || [];
    this.selectedSourceUnitIds = this.selectedSourceUnits.map(unit => unit.id);

    // Reset fees selection when units change
    this.selectedFeeIds = [];
    this.selectedFees = [];
    this.currentFeesPage = 0;

    this.loadFeesFromSelectedUnits();
  }

  /**
   * Load fees from selected source units
   */
  private loadFeesFromSelectedUnits(): void {
    if (this.selectedSourceUnitIds.length === 0) {
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
        this.selectedSourceUnitIds
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
   * Load target units (MULTI_UNIT and single units without parent, excluding source units)
   */
  private loadTargetUnits(): void {
    this.isLoadingTargetUnits = true;

    const pageFilter: PageFilterModel = {
      page: this.currentTargetUnitsPage,
      size: this.targetUnitsPageSize,
      sort: 'name',
      sortDirection: 'asc',
      search: this.targetUnitsSearchTerm,
      advancedSearchFormValue: {
        withParent: false // Only units without parent or MULTI_UNIT
      }
    };

    this.subscriptions.push(
      this.unitApiService.getUnitsByPage(pageFilter).subscribe({
        next: (response) => {
          this.targetUnits = response.content;
          this.totalTargetUnitsElements = response.totalElements;
          this.isLoadingTargetUnits = false;
        },
        error: (error) => {
          console.error('Error loading target units:', error);
          this.toastrService.error('Error loading target units', 'Loading Error');
          this.isLoadingTargetUnits = false;
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
   * Handle target units selection change
   */
  onTargetUnitsSelectionChange(selectedIndices: string[]): void {
    this.selectedTargetUnitIds = selectedIndices.map(index => this.targetUnits[parseInt(index)].id);
    this.selectedTargetUnits = this.targetUnits.filter(unit => this.selectedTargetUnitIds.includes(unit.id));
  }

  /**
   * Search fees
   */
  searchFees(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.feesSearchSubject.next(searchTerm);
  }

  /**
   * Search target units
   */
  searchTargetUnits(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.targetUnitsSearchSubject.next(searchTerm);
  }

  /**
   * Navigate to next step
   */
  nextStep(): void {
    if (this.currentStep === 1 && this.selectedFeeIds.length > 0) {
      this.currentStep = 2;
      this.loadTargetUnits();
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
   * Copy fees to selected target units
   */
  copyFees(overwrite: boolean): void {
    if (this.selectedFeeIds.length === 0 || this.selectedTargetUnitIds.length === 0) {
      return;
    }

    this.isSubmitting = true;
    this.actionType = overwrite ? 'overwrite' : 'copy';

    const payload = {
      feeIds: this.selectedFeeIds,
      unitIds: this.selectedTargetUnitIds
    };

    this.subscriptions.push(
      this.feeApiService.copyFeesToUnits(payload, overwrite).subscribe({
        next: () => {
          this.isSubmitting = false; // Reset loading state
          this.actionConfirmed.emit();
          this.closeModal();

          const action = overwrite ? 'overwritten' : 'copied';
          const message = `${this.selectedFeeIds.length} fee(s) ${action} to ${this.selectedTargetUnitIds.length} unit(s)`;

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
    this.selectedTargetUnitIds = [];
    this.selectedTargetUnits = [];
    this.selectedSourceUnits = [];
    this.selectedSourceUnitIds = [];
    this.feesSearchTerm = '';
    this.targetUnitsSearchTerm = '';
    this.fees = [];
    this.targetUnits = [];
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

  /**
   * Get unit name by ID from selected source units
   */
  getUnitNameById(unitId: string): string {
    const unit = this.selectedSourceUnits.find(u => u.id === unitId);
    return unit ? unit.name : 'Unknown Unit';
  }
}
