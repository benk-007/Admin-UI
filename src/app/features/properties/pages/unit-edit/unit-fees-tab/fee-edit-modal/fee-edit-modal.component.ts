import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
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
  RowComponent,
  InputGroupComponent,
  DropdownComponent,
  DropdownToggleDirective,
  DropdownMenuDirective,
  DropdownItemDirective, InputGroupTextDirective
} from '@coreui/angular';

import { FeeApiService } from '../../../../services/fee-api.service';
import { FeePatchModel } from '../../../../models/fee/patch/fee-patch.model';
import { FeeGetModel } from '../../../../models/fee/get/fee-get.model';
import { FeeModalityEnum } from '../../../../models/fee/enum/fee-modality.enum';
import {TranslatePipe} from '@ngx-translate/core';
import {cilPlus, cilTrash} from '@coreui/icons';
import {noChildAgeOverlapValidator} from '../../../../validators/no-age-overlap.validator';
import {ageRangeValidator} from '../../../../validators/ageBucket.validator';
import {IconDirective} from '@coreui/icons-angular';

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
    TranslatePipe,
    IconDirective,
    InputGroupComponent,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    InputGroupTextDirective
  ],
  templateUrl: './fee-edit-modal.component.html',
  styleUrl: './fee-edit-modal.component.scss'
})
export class FeeEditModalComponent implements OnInit, OnDestroy {
  icons = { cilTrash, cilPlus };

  @Input() feeToEdit!: FeeGetModel;
  @Output() actionConfirmed = new EventEmitter<FeeGetModel>();

  feeForm: FormGroup;
  isSubmitting = false;

  // Enum values for template
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
    const form = this.fb.group({
      name: ['', [Validators.required]],
      amount: [null, [Validators.required, Validators.min(0)]],
      modality: [FeeModalityEnum.PER_STAY, [Validators.required]],
      description: [''],
      active: [true],
      required:[false],
      additionalGuestPrices: this.fb.array([], [noChildAgeOverlapValidator])
    });

    // Watch modality changes to show/hide additional guest prices
    form.get('modality')?.valueChanges.subscribe(modality => {
      if (modality) {
        this.onModalityChange(modality);
      }
    });

    return form;
  }

  /**
   * Populate form with existing fee data
   */
  private populateForm(): void {
    this.feeForm.patchValue({
      name: this.feeToEdit.name,
      amount: this.feeToEdit.amount,
      modality: this.feeToEdit.modality,
      description: this.feeToEdit.description || '',
      active: this.feeToEdit.active,
      required: this.feeToEdit.required || false
    });

    // Populate additional guest prices if they exist
    if (this.shouldShowAdditionalGuestPrices() &&
      this.feeToEdit.additionalGuestPrices &&
      this.feeToEdit.additionalGuestPrices.length > 0) {

      const additionalGuestPrices = this.feeForm.get('additionalGuestPrices') as FormArray;

      this.feeToEdit.additionalGuestPrices.forEach((price: any) => {
        console.log('Adding price:', price);

        const priceGroup = this.fb.group({
          id: [price.id],
          guestCount: [price.guestCount, [Validators.required, Validators.min(1)]],
          guestType: [price.guestType, [Validators.required]],
          amountType: [price.amountType, [Validators.required]],
          value: [price.value, [Validators.required, Validators.min(0)]]
        });

        if (price.guestType === 'CHILD' && price.ageBucket) {
          (priceGroup as FormGroup).addControl(
            'ageBucket',
            this.fb.group(
              {
                fromAge: [price.ageBucket.fromAge, [Validators.required, Validators.min(0)]],
                toAge: [price.ageBucket.toAge, [Validators.required, Validators.min(0)]]
              },
              { validators: ageRangeValidator() }
            )
          );
        }

        // Add guest type change listener
        const guestTypeControl = priceGroup.get('guestType');
        guestTypeControl?.valueChanges.subscribe(type => {
          if (type === 'CHILD' && !priceGroup.get('ageBucket')) {
            (priceGroup as FormGroup).addControl(
              'ageBucket',
              this.fb.group({
                fromAge: [0, [Validators.required, Validators.min(0)]],
                toAge: [0, [Validators.required, Validators.min(0)]]
              }, { validators: ageRangeValidator() })
            );
          } else if (type === 'ADULT' && priceGroup.get('ageBucket')) {
            (priceGroup as FormGroup).removeControl('ageBucket');
          }
        });

        additionalGuestPrices.push(priceGroup);
      });
    }
  }

  /**
   * Get additional guest prices form array
   */
  get additionalGuestPrices(): FormArray {
    return this.feeForm.get('additionalGuestPrices') as FormArray;
  }

  /**
   * Check if modality supports additional guest prices
   */
  shouldShowAdditionalGuestPrices(): boolean {
    const modality = this.feeForm.get('modality')?.value;
    return modality === FeeModalityEnum.PER_PERSON ||
      modality === FeeModalityEnum.PER_PERSON_PER_NIGHT;
  }

  /**
   * Handle modality change
   */
  onModalityChange(modality: FeeModalityEnum | null): void {
    if (!this.shouldShowAdditionalGuestPrices()) {
      this.additionalGuestPrices.clear();
    }
  }

  /**
   * Add additional guest price
   */
  addAdditionalGuestPrice(): void {
    const additionalGuestPrices = this.additionalGuestPrices;

    const hasAdult = additionalGuestPrices.controls.some(
      group => group.get('guestType')?.value === 'ADULT'
    );

    const defaultGuestType = hasAdult ? 'CHILD' : 'ADULT';

    const priceGroup = this.fb.group({
      id: [null],
      guestCount: [1, [Validators.required, Validators.min(1)]],
      guestType: [defaultGuestType, [Validators.required]],
      amountType: ['FLAT', [Validators.required]],
      value: [0, [Validators.required, Validators.min(0)]]
    });

    if (defaultGuestType === 'CHILD') {
      (priceGroup as FormGroup).addControl(
        'ageBucket',
        this.fb.group(
          {
            fromAge: [0, [Validators.required, Validators.min(0)]],
            toAge: [0, [Validators.required, Validators.min(0)]]
          },
          { validators: ageRangeValidator() }
        )
      );
    }

    const guestTypeControl = priceGroup.get('guestType');
    guestTypeControl?.valueChanges.subscribe(type => {
      if (type === 'CHILD' && !priceGroup.get('ageBucket')) {
        (priceGroup as FormGroup).addControl(
          'ageBucket',
          this.fb.group({
            fromAge: [0, [Validators.required, Validators.min(0)]],
            toAge: [0, [Validators.required, Validators.min(0)]]
          }, { validators: ageRangeValidator() })
        );
      } else if (type === 'ADULT' && priceGroup.get('ageBucket')) {
        (priceGroup as FormGroup).removeControl('ageBucket');
      }
    });

    additionalGuestPrices.push(priceGroup);
  }

  /**
   * Remove additional guest price
   */
  removeAdditionalGuestPrice(index: number): void {
    if (this.additionalGuestPrices.length > 0) {
      this.additionalGuestPrices.removeAt(index);
    }
  }

  /**
   * Check if there's already an adult guest type (excluding current index)
   */
  hasAdult(currentIndex: number): boolean {
    return this.additionalGuestPrices.controls
      .some((group, index) => index !== currentIndex && group.get('guestType')?.value === 'ADULT');
  }

  /**
   * Set amount type for a specific price group
   */
  setAmountType(index: number, amountType: string): void {
    const priceGroup = this.additionalGuestPrices.at(index);
    priceGroup.get('amountType')?.setValue(amountType);
  }

  /**
   * Get amount type label for display
   */
  getAmountTypeLabel(amountType: string): string {
    return amountType === 'FLAT' ? 'MAD' : '%';
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
      modality: formValue.modality,
      description: formValue.description?.trim() || undefined,
      active: formValue.active,
      required: formValue.required,
      additionalGuestPrices: formValue.additionalGuestPrices
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
