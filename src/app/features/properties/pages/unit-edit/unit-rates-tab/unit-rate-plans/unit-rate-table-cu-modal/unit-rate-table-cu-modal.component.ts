import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {cilTrash} from '@coreui/icons';
import {RateApiService} from '../../../../../services/rate-api.service';
import {noChildAgeOverlapValidator} from '../../../../../validators/no-age-overlap.validator';
import {minMaxStayValidator} from '../../../../../validators/min-max-stay.validator';
import {ageRangeValidator} from '../../../../../validators/ageBucket.validator';
import {IconDirective} from '@coreui/icons-angular';
import {
  ButtonDirective,
  ButtonGroupComponent,
  ColComponent, DropdownComponent, DropdownItemDirective, DropdownMenuDirective, DropdownToggleDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from '@coreui/angular';
import {JsonPipe, NgClass, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {NgOptionTemplateDirective, NgSelectComponent} from '@ng-select/ng-select';
import {RateTableGetModel} from '../../../../../models/rate/get/rate-table.get.model';
import {NgxDaterangepickerBootstrapDirective} from 'ngx-daterangepicker-bootstrap';
import dayjs from 'dayjs';

@Component({
  selector: 'app-unit-rate-table-create-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IconDirective,
    ColComponent,
    RowComponent,
    ButtonDirective,
    FormControlDirective,
    FormLabelDirective,
    NgClass,
    NgSelectComponent,
    NgOptionTemplateDirective,
    TranslatePipe,
    ButtonGroupComponent,
    FormCheckLabelDirective,
    FormDirective,
    NgSwitch,
    NgSwitchCase,
    FormFeedbackComponent,
    FormSelectDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    NgxDaterangepickerBootstrapDirective,
    NgIf,
    JsonPipe,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective
  ],
  templateUrl: './unit-rate-table-cu-modal.component.html',
  styleUrl: './unit-rate-table-cu-modal.component.scss'
})
export class UnitRateTableCuModalComponent implements OnInit, OnDestroy {
  @Output() actionConfirmed = new EventEmitter<void>();
  @Input() rateTableToEdit?: RateTableGetModel;
  ratePlanId!: string;
  unitId!: string;

  icons = {cilTrash};
  rateTableForm: FormGroup;
  subscriptions: Subscription[] = [];

  isNavigating = false;

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
    public modalRef: BsModalRef,
    private readonly fb: FormBuilder,
    private readonly rateApiService: RateApiService,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService
  ) {
    this.rateTableForm = this.fb.group({
      name: [null, Validators.required],
      dateRange: [null, Validators.required],
      type: ['STANDARD', Validators.required],
      nightly: [null, Validators.min(1)],
      lowRate: [null, Validators.min(1)],
      lowestOccupancy: [null, Validators.min(1)],
      maxRate: [null, Validators.min(1)],
      maxOccupancy: [null, Validators.min(1)],
      minStay: [null, [Validators.min(1)]],
      maxStay: [null, [Validators.min(1)]],
      daySpecificRates: this.fb.array([]),
      additionalGuestFees: this.fb.array([], [noChildAgeOverlapValidator])
    }, {
      validators: [minMaxStayValidator()]
    });
  }

  ngOnInit(): void {
    this.rateTableForm.get('type')?.valueChanges.subscribe(type => {
      if (type === 'STANDARD') {
        this.rateTableForm.get('nightly')?.setValidators([Validators.required, Validators.min(1)]);
        this.rateTableForm.get('lowRate')?.clearValidators();
        this.rateTableForm.get('lowestOccupancy')?.clearValidators();
        this.rateTableForm.get('maxRate')?.clearValidators();
        this.rateTableForm.get('maxOccupancy')?.clearValidators();
      } else {
        this.rateTableForm.get('nightly')?.clearValidators();
        this.rateTableForm.get('lowRate')?.setValidators([Validators.required, Validators.min(1)]);
        this.rateTableForm.get('lowestOccupancy')?.setValidators([Validators.required, Validators.min(1)]);
        this.rateTableForm.get('maxRate')?.setValidators([Validators.required, Validators.min(1)]);
        this.rateTableForm.get('maxOccupancy')?.setValidators([Validators.required, Validators.min(1)]);
      }
      this.rateTableForm.get('nightly')?.updateValueAndValidity();
      this.rateTableForm.get('lowRate')?.updateValueAndValidity();
      this.rateTableForm.get('lowestOccupancy')?.updateValueAndValidity();
      this.rateTableForm.get('maxRate')?.updateValueAndValidity();
      this.rateTableForm.get('maxOccupancy')?.updateValueAndValidity();
    });

    if (this.rateTableToEdit) {
      this.rateTableForm.patchValue({
        name: this.rateTableToEdit.name,
        dateRange: {
          startDate: this.rateTableToEdit.startDate,
          endDate: this.rateTableToEdit.endDate
        },
        type: this.rateTableToEdit.type,
        nightly: this.rateTableToEdit.nightly,
        lowRate: this.rateTableToEdit.lowRate,
        lowestOccupancy: this.rateTableToEdit.lowestOccupancy,
        maxRate: this.rateTableToEdit.maxRate,
        maxOccupancy: this.rateTableToEdit.maxOccupancy,
        minStay: this.rateTableToEdit.minStay,
        maxStay: this.rateTableToEdit.maxStay
      });

      // Populate Day Specific Rates
      this.rateTableToEdit.daySpecificRates?.forEach(rate => {
        this.daySpecificRates.push(this.fb.group({
          id: [rate.id],
          nightly: [rate.nightly, [Validators.required, Validators.min(1)]],
          days: [rate.days, [Validators.required]]
        }));
      });

      // Populate Additional Guest Fees
      this.rateTableToEdit.additionalGuestFees?.forEach(fee => {
        const group = this.fb.group({
          id: [fee.id],
          guestCount: [fee.guestCount, [Validators.required, Validators.min(1)]],
          guestType: [fee.guestType, [Validators.required]],
          amountType: [fee.amountType, [Validators.required]],
          value: [fee.value, [Validators.required, Validators.min(0)]]
        });

        if (fee.guestType === 'CHILD') {
          (group as FormGroup).addControl(
            'ageBucket',
            this.fb.group({
              fromAge: [fee.ageBucket?.fromAge, [Validators.required, Validators.min(0)]],
              toAge: [fee.ageBucket?.toAge, [Validators.required, Validators.min(0)]]
            }, {validators: ageRangeValidator()})
          );
        }

        this.additionalGuestFees.push(group);
      });
    }

  }

  onSubmit(): void {
    if (this.rateTableForm.invalid) {
      this.rateTableForm.markAllAsTouched();
      return;
    }

    const raw = {...this.rateTableForm.value};

    raw.startDate = raw.dateRange?.startDate ? dayjs(raw.dateRange.startDate).format('YYYY-MM-DD') : null;
    raw.endDate = raw.dateRange?.endDate ? dayjs(raw.dateRange.endDate).format('YYYY-MM-DD') : null;

    delete raw.dateRange;

    raw.additionalGuestFees = raw.additionalGuestFees.map((fee: any) => {
      if (fee.guestType === 'ADULT') {
        delete fee.ageBucket;
      }
      return fee;
    });

    const payload: any = {
      name: raw.name,
      startDate: raw.startDate,
      endDate: raw.endDate,
      type: raw.type,
      minStay: raw.minStay,
      maxStay: raw.maxStay,
      daySpecificRates: raw.daySpecificRates,
      additionalGuestFees: raw.additionalGuestFees,
      ratePlan: {id: this.ratePlanId}
    };

    if (raw.type === 'STANDARD') {
      payload.nightly = raw.nightly;
    } else if (raw.type === 'DYNAMIC') {
      payload.lowRate = raw.lowRate;
      payload.lowestOccupancy = raw.lowestOccupancy;
      payload.maxRate = raw.maxRate;
      payload.maxOccupancy = raw.maxOccupancy;
    }


    let request$;

    if (this.rateTableToEdit) {
      request$ = this.rateApiService.updateRateTable(this.rateTableToEdit.id, payload);
    } else {
      request$ = this.rateApiService.createRateTable(payload);
    }

    request$.subscribe({
      next: () => {
        if (this.rateTableToEdit) {
          this.toastrService.info(
            this.translateService.instant('units.edit-unit.tabs.rates.rateTable.edit.notifications.success')
          );
        } else {
          this.toastrService.success(
            this.translateService.instant('units.edit-unit.tabs.rates.rateTable.create.notifications.success')
          );
        }
        this.actionConfirmed.emit();
        this.modalRef.hide();
      },
      error: (err: any) => {
        console.error('Rate table save failed:', err);

        const validationError = err?.error?.errors?.startDate?.find(
          (e: any) => e.code === 'ValidRateTableDates'
        );

        if (validationError) {
          this.toastrService.error(validationError.message);
          return;
        }

        const errorKey = this.rateTableToEdit
          ? 'units.edit-unit.tabs.rates.rateTable.edit.notifications.error'
          : 'units.edit-unit.tabs.rates.rateTable.create.notifications.error';

        this.toastrService.error(this.translateService.instant(errorKey));
      }
    });
  }

  get dateRangeControl(): FormControl {
    return this.rateTableForm.get('dateRange') as FormControl;
  }


  addDaySpecificPricing(): void {
    this.daySpecificRates.push(
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
        this.fb.group({
          fromAge: [0, [Validators.required, Validators.min(0)]],
          toAge: [0, [Validators.required, Validators.min(0)]]
        }, {validators: ageRangeValidator()})
      );
    }

    feeGroup.get('guestType')?.valueChanges.subscribe(type => {
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
    return this.rateTableForm.get('daySpecificRates') as FormArray;
  }

  get additionalGuestFees(): FormArray {
    return this.rateTableForm.get('additionalGuestFees') as FormArray;
  }

  removeDaySpecificPricing(index: number): void {
    this.daySpecificRates.removeAt(index);
  }

  removeAdditionalGuestFee(index: number): void {
    this.additionalGuestFees.removeAt(index);
  }

  getAvailableDays(index: number): { label: string, value: string }[] {
    const selectedInOthers = this.daySpecificRates.controls
      .filter((_, i) => i !== index)
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

  closeModal(): void {
    this.modalRef.hide();
    this.rateTableForm.reset();
  }

  ngOnDestroy(): void {
    this.isNavigating = true;
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
