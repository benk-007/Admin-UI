import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  ButtonDirective,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from '@coreui/angular';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

import {RateApiService} from '../../../../services/rate-api.service';
import {IconDirective} from '@coreui/icons-angular';
import {cilPlus, cilTrash} from '@coreui/icons';
import {NgOptionTemplateDirective, NgSelectComponent} from '@ng-select/ng-select';
import {NgClass} from '@angular/common';
import {noChildAgeOverlapValidator} from '../../../../validators/no-age-overlap.validator';
import {minMaxStayValidator} from '../../../../validators/min-max-stay.validator';
import {ageRangeValidator} from '../../../../validators/ageBucket.validator';

@Component({
  selector: 'app-unit-default-rate',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    ButtonDirective,
    FormDirective,
    ReactiveFormsModule,
    FormControlDirective,
    FormLabelDirective,
    TranslatePipe,
    IconDirective,
    NgSelectComponent,
    NgOptionTemplateDirective,
    NgClass,
    FormFeedbackComponent,
    FormSelectDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective
  ],
  templateUrl: './unit-default-rate.component.html',
  styleUrl: './unit-default-rate.component.scss'
})
export class UnitDefaultRateComponent implements OnInit, OnDestroy {
  icons = {cilTrash, cilPlus};
  unitId!: string;
  ratesForm: FormGroup;
  private readonly subscriptions: Subscription[] = [];
  private existingRateId: string | null = null;
  daysOfWeekOptions = [
    {label: 'Monday', value: 'MONDAY'},
    {label: 'Tuesday', value: 'TUESDAY'},
    {label: 'Wednesday', value: 'WEDNESDAY'},
    {label: 'Thursday', value: 'THURSDAY'},
    {label: 'Friday', value: 'FRIDAY'},
    {label: 'Saturday', value: 'SATURDAY'},
    {label: 'Sunday', value: 'SUNDAY'}
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly rateApiService: RateApiService,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
    this.ratesForm = this.fb.group({
      nightly: [null, [Validators.required, Validators.min(1)]],
      minStay: [null],
      maxStay: [null, [Validators.min(1)]],
      daySpecificRates: this.fb.array([]),
      additionalGuestFees: this.fb.array([], [noChildAgeOverlapValidator])
    }, {
      validators: [minMaxStayValidator()]
    });
  }

  ngOnInit(): void {
    this.unitId = this.route.parent?.parent?.parent?.snapshot.params['unitId'];
    console.log("unit ID:", this.unitId)
    if (this.unitId) {
      const sub = this.rateApiService.getDefaultRate(this.unitId).subscribe({
        next: (data) => {
          this.existingRateId = data.id as string;
          this.populateForm(data);
        },
        error: (err) => {
          if (err.status === 404) {
            console.log("No default rate found (404) — starting with empty form.");
          } else {
            this.toastrService.warning(
              this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.load-error.message'),
              this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.load-error.title'));
          }
        }
      });
      this.subscriptions.push(sub);
    }
  }

  private populateForm(data: any): void {
    this.ratesForm.patchValue({
      nightly: data.nightly,
      minStay: data.minStay || null,
      maxStay: data.maxStay
    });

    const daySpecificRates = this.ratesForm.get('daySpecificRates') as FormArray;
    data.daySpecificRates?.forEach((rate: any) => {
      daySpecificRates.push(this.fb.group({
        id: [rate.id],
        nightly: [rate.nightly, [Validators.required, Validators.min(1)]],
        days: [rate.days, [Validators.required]]
      }));
    });

    const additionalGuestFees = this.ratesForm.get('additionalGuestFees') as FormArray;
    data.additionalGuestFees?.forEach((fee: any) => {
      additionalGuestFees.push(this.fb.group({
        id: [fee.id],
        guestCount: [fee.guestCount, [Validators.required, Validators.min(1)]],
        guestType: [fee.guestType, [Validators.required]],
        amountType: [fee.amountType, [Validators.required]],
        value: [fee.value, [Validators.required, Validators.min(0)]],
        ageBucket: this.fb.group({
          fromAge: [fee.ageBucket?.fromAge ?? null],
          toAge: [fee.ageBucket?.toAge ?? null]
        })
      }));
    });
  }

  onSubmit(): void {
    const formValue = this.ratesForm.value

    // Clean up ageBucket for ADULT entries
    formValue.additionalGuestFees = formValue.additionalGuestFees.map((fee: any) => {
      if (fee.guestType === 'ADULT') {
        delete fee.ageBucket;
      }
      return fee;
    });
    const payload = {
      ...formValue,
      unitId: this.unitId
    };

    const request$ = this.existingRateId
      ? this.rateApiService.patchDefaultRate(this.existingRateId, payload)
      : this.rateApiService.postDefaultRate(payload);

    const sub = request$.subscribe({
      next: (data) => {
        this.existingRateId = data.id ?? null;
        this.ratesForm.reset();
        (this.ratesForm.get('daySpecificRates') as FormArray).clear();
        (this.ratesForm.get('additionalGuestFees') as FormArray).clear();
        this.populateForm(data);


        this.toastrService.info(
          this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.success.message'),
          this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.success.title'));
      },
      error: () => {
        this.toastrService.error(
          this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.error.message'),
          this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.error.title'));
      }
    });

    this.subscriptions.push(sub);
  }

  addDaySpecificPricing(): void {
    const daySpecificRates = this.ratesForm.get('daySpecificRates') as FormArray;
    daySpecificRates.push(
      this.fb.group({
        id: [null],
        nightly: [null, [Validators.required, Validators.min(1)]],
        days: [[], [Validators.required]]
      })
    );
  }

  setAmountType(index: number, amountType: string): void {
    const feeGroup = this.additionalGuestFees.at(index);
    feeGroup.get('amountType')?.setValue(amountType);
  }

  addAdditionalGuestFee(): void {
    const additionalGuestFees = this.additionalGuestFees;

    const hasAdult = additionalGuestFees.controls.some(
      group => group.get('guestType')?.value === 'ADULT'
    );

    const defaultGuestType = hasAdult ? 'CHILD' : 'ADULT';

    const feeGroup = this.fb.group({
      id: [null],
      guestCount: [1, [Validators.required, Validators.min(1)]],
      guestType: [defaultGuestType, [Validators.required]],
      amountType: ['FLAT', [Validators.required]],
      value: [0, [Validators.required, Validators.min(0)]]
    });

    if (defaultGuestType === 'CHILD') {
      (feeGroup as FormGroup).addControl(
        'ageBucket',
        this.fb.group(
          {
            fromAge: [0, [Validators.required, Validators.min(0)]],
            toAge: [0, [Validators.required, Validators.min(0)]]
          },
          {validators: ageRangeValidator()}
        )
      );
    }

    const guestTypeControl = feeGroup.get('guestType');
    guestTypeControl?.valueChanges.subscribe(type => {
      if (type === 'CHILD' && !feeGroup.get('ageBucket')) {
        (feeGroup as FormGroup).addControl(
          'ageBucket',
          this.fb.group({
            fromAge: [0, [Validators.required, Validators.min(0)]],
            toAge: [0, [Validators.required, Validators.min(0)]]
          }, {validators: ageRangeValidator()})
        );
      } else if (type === 'ADULT' && feeGroup.get('ageBucket')) {
        (feeGroup as FormGroup).removeControl('ageBucket');
      }
    });

    additionalGuestFees.push(feeGroup);
  }

  get daySpecificRates(): FormArray {
    return this.ratesForm.get('daySpecificRates') as FormArray;
  }

  get additionalGuestFees(): FormArray {
    return this.ratesForm.get('additionalGuestFees') as FormArray;
  }


  removeDaySpecificPricing(index: number): void {
    const daySpecificRates = this.ratesForm.get('daySpecificRates') as FormArray;
    if (daySpecificRates.length > 0) {
      daySpecificRates.removeAt(index);
    }
  }

  removeAdditionalGuestFee(index: number): void {
    const additionalGuestFees = this.ratesForm.get('additionalGuestFees') as FormArray;
    if (additionalGuestFees.length > 0) {
      additionalGuestFees.removeAt(index);
    }
  }

  getAvailableDays(index: number): { label: string, value: string }[] {
    const selectedInOthers = this.daySpecificRates.controls
      .filter((_, i) => i !== index) // exclude current entry
      .map(ctrl => ctrl.get('days')?.value ?? [])
      .flat();

    return this.daysOfWeekOptions.filter(option =>
      !selectedInOthers.includes(option.value)
    );
  }

  isDayAvailable(index: number, dayValue: string): boolean {
    return this.getAvailableDays(index).some(day => day.value === dayValue);
  }

  onDaySelect(event: any, index: number) {
    if (!this.isDayAvailable(index, event.value)) {
      const currentValue = this.daySpecificRates.at(index).get('days')?.value || [];
      this.daySpecificRates.at(index).get('days')?.setValue(currentValue);
      return;
    }
  }

  onDayRemove(event: any, index: number) {
  }

  getDayClass(dayValue: string, index: number) {
    return {
      'text-muted': !this.isDayAvailable(index, dayValue),
      'cursor-not-allowed': !this.isDayAvailable(index, dayValue)
    };
  }

  hasAdult(currentIndex: number): boolean {
    return this.additionalGuestFees.controls
      .some((group, index) => index !== currentIndex && group.get('guestType')?.value === 'ADULT');
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
