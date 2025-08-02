import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  RowComponent
} from '@coreui/angular';

import { FeeApiService } from '../../../../services/fee-api.service';
import { FeePatchModel } from '../../../../models/fee/patch/fee-patch.model';
import { FeeGetModel } from '../../../../models/fee/get/fee-get.model';
import { FeeTypeEnum } from '../../../../models/fee/enum/fee-type.enum';
import { FeeModalityEnum } from '../../../../models/fee/enum/fee-modality.enum';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-fee-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonDirective,
    ColComponent,
    FormControlDirective,
    FormDirective,
    FormFeedbackComponent,
    FormLabelDirective,
    FormSelectDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    RowComponent,
    TranslatePipe
  ],
  templateUrl: './fee-edit-modal.component.html',
  styleUrl: './fee-edit-modal.component.scss'
})
export class FeeEditModalComponent implements OnInit, OnDestroy {

  @Input() feeToEdit!: FeeGetModel;
  @Output() actionConfirmed = new EventEmitter<FeeGetModel>();

  feeForm: FormGroup;
  isSubmitting = false;

  // Enum values for template
  feeTypes = Object.values(FeeTypeEnum);
  feeModalities = Object.values(FeeModalityEnum);

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly feeApiService: FeeApiService,
    private readonly modalRef: BsModalRef,
    private readonly toastrService: ToastrService
  ) {
    this.feeForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.feeToEdit) {
      this.populateForm();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Create the reactive form
   */
  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      type: [FeeTypeEnum.FLAT, [Validators.required]],
      modality: [FeeModalityEnum.PER_STAY, [Validators.required]],
      description: [''],
      active: [true]
    });
  }

  /**
   * Populate form with existing fee data
   */
  private populateForm(): void {
    this.feeForm.patchValue({
      name: this.feeToEdit.name,
      amount: this.feeToEdit.amount,
      type: this.feeToEdit.type,
      modality: this.feeToEdit.modality,
      description: this.feeToEdit.description || '',
      active: this.feeToEdit.active
    });
  }

  /**
   * Submit the form
   */
  submit(): void {
    if (!this.feeForm.valid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.feeForm.value;

    const payload: FeePatchModel = {
      name: formValue.name.trim(),
      amount: parseFloat(formValue.amount),
      type: formValue.type,
      modality: formValue.modality,
      description: formValue.description?.trim() || undefined,
      active: formValue.active
    };

    this.subscriptions.push(
      this.feeApiService.updateFee(this.feeToEdit.id, payload).subscribe({
        next: (updatedFee) => {
          this.isSubmitting = false; // Reset loading state
          this.actionConfirmed.emit(updatedFee);
          this.closeModal();
          this.toastrService.info(
            `Fee "${updatedFee.name}" has been successfully updated`,
            'Fee Updated'
          );
        },
        error: (error) => {
          console.error('Error updating fee:', error);
          this.isSubmitting = false; // Reset loading state

          // Handle specific error cases
          const errorMessage = error?.error?.detail ||
            'An error occurred while updating the fee. Please try again.';

          this.toastrService.error(errorMessage, 'Update Failed');
        }
      })
    );
  }

  /**
   * Close modal and reset form
   */
  closeModal(): void {
    if (this.isSubmitting) return;

    this.modalRef.hide();
    this.feeForm.reset();
    this.isSubmitting = false;
  }

  /**
   * Get modality key for translation
   */
  getModalityKey(modality: FeeModalityEnum): string {
    const modalityMap: { [key in FeeModalityEnum]: string } = {
      [FeeModalityEnum.PER_STAY]: 'per-stay',
      [FeeModalityEnum.PER_NIGHT]: 'per-night',
      [FeeModalityEnum.PER_PERSON]: 'per-person',
      [FeeModalityEnum.PER_PERSON_PER_NIGHT]: 'per-person-per-night'
    };
    return modalityMap[modality];
  }
}
