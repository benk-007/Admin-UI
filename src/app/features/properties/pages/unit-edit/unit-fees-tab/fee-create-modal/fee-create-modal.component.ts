import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
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
import { FeePostModel } from '../../../../models/fee/post/fee-post.model';
import { FeeGetModel } from '../../../../models/fee/get/fee-get.model';
import { FeeTypeEnum } from '../../../../models/fee/enum/fee-type.enum';
import { FeeModalityEnum } from '../../../../models/fee/enum/fee-modality.enum';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-fee-create-modal',
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
  templateUrl: './fee-create-modal.component.html',
  styleUrl: './fee-create-modal.component.scss'
})
export class FeeCreateModalComponent implements OnDestroy {

  @Input() unitId!: string;
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
   * Submit the form
   */
  submit(): void {
    if (!this.feeForm.valid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.feeForm.value;

    const payload: FeePostModel = {
      name: formValue.name.trim(),
      amount: parseFloat(formValue.amount),
      type: formValue.type,
      modality: formValue.modality,
      description: formValue.description?.trim() || undefined,
      active: formValue.active,
      unit: { id: this.unitId }
    };

    this.subscriptions.push(
      this.feeApiService.createFee(payload).subscribe({
        next: (createdFee) => {
          this.actionConfirmed.emit(createdFee);
          this.closeModal();
          this.toastrService.success(
            `Fee "${createdFee.name}" has been successfully created`,
            'Fee Created'
          );
        },
        error: (error) => {
          console.error('Error creating fee:', error);
          this.isSubmitting = false;

          // Handle specific error cases
          const errorMessage = error?.error?.detail ||
            'An error occurred while creating the fee. Please try again.';

          this.toastrService.error(errorMessage, 'Creation Failed');
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
    this.feeForm.reset({
      type: FeeTypeEnum.FLAT,
      modality: FeeModalityEnum.PER_STAY,
      active: true
    });
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
