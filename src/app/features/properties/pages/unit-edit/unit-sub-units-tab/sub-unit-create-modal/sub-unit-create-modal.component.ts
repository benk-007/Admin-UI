import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from "@angular/common";
import { Subscription } from 'rxjs';

// CoreUI Components
import {
  ButtonDirective, ColComponent, RowComponent, FormDirective,
  FormControlDirective, FormLabelDirective, FormFeedbackComponent,
  FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilTrash } from '@coreui/icons';

// Services and Components
import { UnitApiService } from '../../../../services/unit-api.service';
import { UnitSelectComponent } from '../../../../../../shared/components/unit-select/unit-select.component';

@Component({
  selector: 'app-sub-unit-create-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ButtonDirective,
    ColComponent,
    RowComponent,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    IconDirective,
    UnitSelectComponent
  ],
  templateUrl: './sub-unit-create-modal.component.html',
  styleUrl: './sub-unit-create-modal.component.scss'
})
export class SubUnitCreateModalComponent implements OnDestroy {

  // Form and state properties
  subUnitsForm: FormGroup;
  isSubmitting: boolean = false;
  multiUnitId!: string;
  icons = { cilTrash };

  // Output events
  @Output() subUnitCreated = new EventEmitter<any>();

  // Subscription management
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private modalRef: BsModalRef,
    private unitApiService: UnitApiService,
    private translateService: TranslateService,
    private toastrService: ToastrService
  ) {
    this.subUnitsForm = this.fb.group({
      newSubUnits: this.fb.array([]),
      existingUnits: [null]
    });
  }

  /**
   * Get FormArray for new sub-units
   * @returns FormArray containing new sub-unit form groups
   */
  get newSubUnits(): FormArray {
    return this.subUnitsForm.get('newSubUnits') as FormArray;
  }

  /**
   * Add new sub-unit form group to the FormArray
   * Limits maximum of 10 sub-units
   */
  addNewSubUnit(): void {
    if (this.newSubUnits.length >= 10) {
      this.toastrService.warning('Maximum 10 sub-units allowed', 'Limit Reached');
      return;
    }

    const subUnitGroup = this.fb.group({
      name: ['', [Validators.required]],
      priority: [this.getNextPriority(), [Validators.required, Validators.min(1)]],
      readiness: [false]
    });

    this.newSubUnits.push(subUnitGroup);
  }

  /**
   * Remove sub-unit form group from FormArray
   * @param index - Index of sub-unit to remove
   */
  removeNewSubUnit(index: number): void {
    this.newSubUnits.removeAt(index);
  }

  /**
   * Calculate next available priority number
   * @returns Next sequential priority number
   */
  private getNextPriority(): number {
    const existingPriorities = this.newSubUnits.controls
      .map(control => control.get('priority')?.value)
      .filter(priority => priority !== null && priority !== undefined)
      .map(priority => Number(priority))
      .sort((a, b) => a - b);

    for (let i = 1; i <= existingPriorities.length + 1; i++) {
      if (!existingPriorities.includes(i)) {
        return i;
      }
    }
    return existingPriorities.length + 1;
  }

  /**
   * Check if form has valid sub-units to submit
   * @returns True if there are valid new sub-units or existing units selected
   */
  hasValidSubUnits(): boolean {
    const hasNewSubUnits = this.newSubUnits.controls.some(control =>
      control.get('name')?.value &&
      control.get('name')?.value.trim() &&
      control.valid
    );

    const hasExistingUnits = this.subUnitsForm.get('existingUnits')?.value &&
      this.subUnitsForm.get('existingUnits')?.value.length > 0;

    return hasNewSubUnits || hasExistingUnits;
  }

  /**
   * Submit form and create sub-units
   * Handles both new sub-unit creation and existing unit assignment
   */
  onSubmit(): void {
    if (!this.hasValidSubUnits()) {
      this.newSubUnits.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.subUnitsForm.value;
    const subUnits: any[] = [];

    // Process new sub-units
    if (formValue.newSubUnits && formValue.newSubUnits.length > 0) {
      formValue.newSubUnits.forEach((subUnit: any) => {
        if (subUnit.name && subUnit.name.trim()) {
          subUnits.push({
            name: subUnit.name.trim(),
            priority: subUnit.priority,
            readiness: subUnit.readiness
          });
        }
      });
    }

    // Process existing units assignment
    if (formValue.existingUnits && formValue.existingUnits.length > 0) {
      formValue.existingUnits.forEach((unit: any) => {
        subUnits.push({
          unitId: unit.id
        });
      });
    }

    const payload = { subUnits: subUnits };

    console.log('Creating sub-units with payload:', payload);

    this.subscriptions.push(
      this.unitApiService.postSubUnit(this.multiUnitId, payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.subUnitCreated.emit(response);
          this.closeModal();

          this.toastrService.success(
            `${subUnits.length} SubUnit${subUnits.length > 1 ? 's' : ''} added successfully`,
            'SubUnits Added'
          );
        },
        error: (err) => {
          console.error('Error creating sub-units:', err);
          this.isSubmitting = false;
          this.toastrService.error(
            'Failed to add SubUnits. Please try again.',
            'Creation Failed'
          );
        }
      })
    );
  }

  /**
   * Close modal and reset form
   */
  closeModal(): void {
    this.modalRef.hide();
    this.subUnitsForm.reset();

    // Reset FormArray
    while (this.newSubUnits.length !== 0) {
      this.newSubUnits.removeAt(0);
    }
  }

  /**
   * TrackBy function for FormArray performance optimization
   * @param index - Array index
   * @param item - Form control item
   * @returns Index for tracking
   */
  trackByIndex(index: number, item: any): number {
    return index;
  }

  /**
   * Cleanup subscriptions on component destroy
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
