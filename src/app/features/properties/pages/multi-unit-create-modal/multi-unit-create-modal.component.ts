import {Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {
  ButtonDirective,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent
} from "@coreui/angular";
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {BsModalRef} from "ngx-bootstrap/modal";
import {ToastrService} from "ngx-toastr";
import {Subscription} from "rxjs";
import {CountryISO, NgxIntlTelInputModule, SearchCountryField} from "ngx-intl-tel-input";
import {emailValidator} from "../../../../shared/validators/email.validator";
import {CountrySelectComponent} from "../../../../shared/components/country-select/country-select.component";
import {noNumbersValidator} from "../../../../shared/validators/no-number.validator";
import {UnitApiService} from "../../services/unit-api.service";
import {UnitSelectComponent} from "../../../../shared/components/unit-select/unit-select.component";
import {CommonModule} from "@angular/common";
// import {MultiUnitPostModel, SubUnitModel} from "../../models/multi-unit-post.model";
import {IconDirective} from "@coreui/icons-angular";
import {cilTrash} from "@coreui/icons";

@Component({
  selector: 'app-multi-unit-create-modal',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    ButtonDirective,
    ColComponent,
    RowComponent,
    FormControlDirective,
    FormsModule,
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    FormDirective,
    FormFeedbackComponent,
    FormLabelDirective,
    CountrySelectComponent,
    UnitSelectComponent,
    CommonModule,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    TranslatePipe,
    IconDirective
  ],
  templateUrl: './multi-unit-create-modal.component.html',
  styleUrl: './multi-unit-create-modal.component.scss'
})
export class MultiUnitCreateModalComponent implements OnDestroy {
 icons = {
    cilTrash
  };
  // multiUnitForm: FormGroup;
  currentStep: 1 | 2 = 1;
  isSubmitting: boolean = false;
  @Output() actionConfirmed = new EventEmitter<string>();

  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;
  private readonly subscriptions: Subscription[] = [];

  public constructor(
    private readonly fb: FormBuilder,
    private readonly unitApiService: UnitApiService,
    private readonly modalRef: BsModalRef,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
   /* this.multiUnitForm = this.fb.group({
      name: [null, [Validators.required]],
      street1: [null, [Validators.required]],
      street2: [null],
      postcode: [null],
      city: [null, [Validators.required, noNumbersValidator()]],
      country: [null, [Validators.required]],
      mobile: [null, [Validators.required]],
      email: [null, [emailValidator()]],
      existingUnits: [null],
      newSubUnits: this.fb.array([])
    });*/
  }
/*
  get newSubUnits(): FormArray {
    return this.multiUnitForm.get('newSubUnits') as FormArray;
  }


  // Step Navigation Methods
  nextStep(): void {
    if (this.currentStep === 1 && this.isStep1Valid()) {
      this.currentStep = 2;
    }
  }

  previousStep(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  isStep1Valid(): boolean {
    const nameValid = this.multiUnitForm.get('name')?.valid;
    return !!nameValid;
  }

  isStep2Valid(): boolean {
    const step2Fields = ['street1', 'city', 'country', 'mobile'];
    return step2Fields.every(field => this.multiUnitForm.get(field)?.valid);
  }

  // Helper methods for template
  getValidNewSubUnitsCount(): number {
    return this.newSubUnits.controls.filter(control =>
      control.get('name')?.value && control.get('name')?.value.trim()
    ).length;
  }

  getExistingUnitsCount(): number {
    const existingUnits = this.multiUnitForm.get('existingUnits')?.value;
    return existingUnits ? existingUnits.length : 0;
  }

  getTotalSubUnitsCount(): number {
    return this.getValidNewSubUnitsCount() + this.getExistingUnitsCount();
  }

  // Sub-unit management methods
  addNewSubUnit(): void {
    if (this.newSubUnits.length >= 10) {
      this.toastrService.warning('Maximum 10 subunits allowed', 'Limit Reached');
      return;
    }

    const subUnitGroup = this.fb.group({
      name: [null, [Validators.required]],
      priority: [this.getNextPriority(), [Validators.required, Validators.min(1)]],
      readiness: [false]
    });

    this.newSubUnits.push(subUnitGroup);
  }

  // Suppression simple sans condition
  removeNewSubUnit(index: number): void {
    this.newSubUnits.removeAt(index);
  }

  // Get next available priority number
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

  // Form submission
  submit(): void {
    if (!this.multiUnitForm.valid) {
      this.toastrService.warning(
        'Please fix the validation errors before proceeding',
        'Validation Error'
      );
      return;
    }

    this.isSubmitting = true;
    const formValue = this.multiUnitForm.value;

    // Build subUnits array
    const subUnits: SubUnitModel[] = [];

    // Add existing units
    if (formValue.existingUnits && formValue.existingUnits.length > 0) {
      formValue.existingUnits.forEach((unit: any) => {
        subUnits.push({
          unitId: unit.id
        });
      });
    }

    // Add new sub-units
    if (formValue.newSubUnits && formValue.newSubUnits.length > 0) {
      formValue.newSubUnits.forEach((subUnit: any) => {
        if (subUnit.name && subUnit.name.trim()) { // Only add if name is provided
          subUnits.push({
            name: subUnit.name.trim(),
            priority: subUnit.priority,
            readiness: subUnit.readiness
          });
        }
      });
    }

    const payload: MultiUnitPostModel = {
      name: formValue.name.trim(),
      nature: "MULTI_UNIT",
      address: {
        street1: formValue.street1.trim(),
        street2: formValue.street2?.trim() || undefined,
        postCode: formValue.postcode?.trim() || undefined,
        city: formValue.city.trim(),
        country: formValue.country
      },
      contact: {
        mobile: formValue.mobile?.e164Number || formValue.mobile,
        email: formValue.email?.trim() || undefined
      },
      subUnits: subUnits
    };

    console.log('Multi-unit payload:', payload);

    // Call API service
    this.subscriptions.push(
      this.unitApiService.postMultiUnit(payload).subscribe({
        next: (data) => {
          console.log('Multi-unit created successfully:', data);
          this.isSubmitting = false;
          this.actionConfirmed.emit("");
          this.closeModal();

          const subUnitsCount = subUnits.length;
          const message = subUnitsCount > 0
            ? `Multi-unit "${data.name}" has been successfully created with ${subUnitsCount} subunit${subUnitsCount > 1 ? 's' : ''}`
            : `Multi-unit "${data.name}" has been successfully created`;

          this.toastrService.success(message, 'Multi-unit Created');
        },
        error: (err) => {
          console.error('Error creating multi-unit:', err);
          this.isSubmitting = false;
          this.toastrService.error(
            'An error occurred while creating the multi-unit. Please try again or contact the support team.',
            'Multi-unit Creation Failed'
          );
        }
      })
    );
  }

  closeModal(): void {
    if (this.isSubmitting) return;

    this.modalRef.hide();
    this.multiUnitForm.reset();
    this.currentStep = 1;
    this.isSubmitting = false;

    // Clear the FormArray - rester vide au démarrage
    while (this.newSubUnits.length !== 0) {
      this.newSubUnits.removeAt(0);
    }
  }*/

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
