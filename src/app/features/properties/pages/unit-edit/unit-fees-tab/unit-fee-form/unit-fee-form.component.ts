import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
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
import {FeeTypeEnum} from '../../../../models/fee/enum/fee-type.enum';
import {FeeModalityEnum} from '../../../../models/fee/enum/fee-modality.enum';


@Component({
  selector: 'app-unit-fee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
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
  ],
  templateUrl: './unit-fee-form.component.html',
  styleUrl: './unit-fee-form.component.scss'
})
export class UnitFeeFormComponent implements OnInit, OnDestroy {

  @Input() unitId!: string;
  @Input() feeData: any; // Initial data for the form
  @Input() formIndex!: number; // Index of this form in the array
  @Output() feeCreated = new EventEmitter<FeeGetModel>();
  @Output() feeCreationError = new EventEmitter<void>();
  @Output() formRemoved = new EventEmitter<void>();

  feeForm: FormGroup;
  isSubmitting = false;

  // Enum values for template
  feeTypes = Object.values(FeeTypeEnum);
  feeModalities = Object.values(FeeModalityEnum);

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly feeApiService: FeeApiService,
    private readonly toastrService: ToastrService
  ) {
    this.feeForm = this.createForm();
  }

  ngOnInit(): void {
    // Watch for changes and auto-submit when all required fields are filled
    this.subscriptions.push(
      this.feeForm.valueChanges.subscribe(() => {
        this.autoSubmitIfValid();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Create the reactive form
   */
  private createForm(): FormGroup {
    return this.fb.group({
      name: [this.feeData?.name || '', [Validators.required]],
      amount: [this.feeData?.amount || '', [Validators.required, Validators.min(0)]],
      type: [this.feeData?.type || FeeTypeEnum.FLAT, [Validators.required]],
      modality: [this.feeData?.modality || FeeModalityEnum.PER_STAY, [Validators.required]],
      description: [this.feeData?.description || ''],
      active: [this.feeData?.active !== undefined ? this.feeData.active : true]
    });
  }

  /**
   * Auto-submit when form is valid and name + amount are filled
   */
  private autoSubmitIfValid(): void {
    const formValue = this.feeForm.value;

    // Check if required fields have meaningful values
    if (formValue.name?.trim() &&
      formValue.amount &&
      parseFloat(formValue.amount) > 0 &&
      !this.isSubmitting) {

      // Small delay to avoid rapid-fire submissions
      setTimeout(() => {
        if (this.feeForm.valid && !this.isSubmitting) {
          this.submitForm();
        }
      }, 500);
    }
  }

  /**
   * Submit the form
   */
  private submitForm(): void {
    if (this.feeForm.valid && !this.isSubmitting) {
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
            this.feeCreated.emit(createdFee);
          },
          error: (error) => {
            console.error('Error creating fee:', error);
            this.toastrService.error(
              'An error occurred while creating the fee. Please try again.',
              'Creation Failed'
            );
            this.feeCreationError.emit();
            this.isSubmitting = false;
          }
        })
      );
    }
  }

  /**
   * Remove this form
   */
  onRemove(): void {
    this.formRemoved.emit();
  }

  /**
   * Get modality display label
   */
  getModalityLabel(modality: FeeModalityEnum): string {
    const labels: { [key in FeeModalityEnum]: string } = {
      [FeeModalityEnum.PER_STAY]: 'Per Stay',
      [FeeModalityEnum.PER_NIGHT]: 'Per Night',
      [FeeModalityEnum.PER_PERSON]: 'Per Person',
      [FeeModalityEnum.PER_PERSON_PER_NIGHT]: 'Per Person/Per Night (PP/PN)'
    };
    return labels[modality];
  }

  /**
   * Get type display label
   */
  getTypeLabel(type: FeeTypeEnum): string {
    return type === FeeTypeEnum.FLAT ? 'Flat' : 'Percent';
  }
}
