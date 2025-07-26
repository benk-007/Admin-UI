import {Component, OnInit, OnDestroy, TemplateRef, ViewChild} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
  FormArray,
  FormControl
} from '@angular/forms';
import dayjs, { Dayjs } from 'dayjs';
import {AvailabilityGetResource} from '../../models/availability/get/availability-get.model';
import {AvailabilityPostResource} from '../../models/availability/post/availability-post.model';
import {SupplementItem} from '../../models/supplement/commons/supplement-item.model';
import {AvailabilityApiService} from '../../services/booking-api.service';
import {ButtonDirective, ColComponent, FormSelectDirective, RowComponent, SpinnerComponent} from '@coreui/angular';
import {DecimalPipe, JsonPipe, NgForOf, NgIf} from '@angular/common';
import {NgxDaterangepickerBootstrapDirective} from 'ngx-daterangepicker-bootstrap';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ToastrService} from 'ngx-toastr';
import {IconDirective} from '@coreui/icons-angular';
import {cilSearch} from '@coreui/icons';
import {PopoverDirective} from 'ngx-bootstrap/popover';
import {EmptyDataComponent} from '../../../../shared/components/empty-data/empty-data.component';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {PartySelectComponent} from '../../../../shared/components/party-select/party-select.component';
import {PartyItemGetModel} from '../../../crm/models/party/party-item-get.model';
import {SegmentSelectComponent} from '../../../../shared/components/segment-select/segment-select.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-availability-list',
  templateUrl: './availability-list.component.html',
  styleUrls: ['./availability-list.component.scss'],
  imports: [
    RowComponent,
    NgIf,
    ColComponent,
    FormsModule,
    NgxDaterangepickerBootstrapDirective,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    ButtonDirective,
    IconDirective,
    PopoverDirective,
    NgForOf,
    FormSelectDirective,
    EmptyDataComponent,
    SpinnerComponent,
    PartySelectComponent,
    SegmentSelectComponent,
    JsonPipe,
    DecimalPipe,
  ],
  standalone: true,
  providers: [BsModalService],
})
export class AvailabilityListComponent implements OnInit, OnDestroy {

  icons = {cilSearch}

  form!: FormGroup;
  dateRange: { startDate: Dayjs; endDate: Dayjs } | null = null;
  availableUnits: AvailabilityGetResource[] = [];
  isSearchPerformed = false;
  isNavigating = false;
  popoverChildrenCount: number = 0;
  firstCallDone: boolean = true;
  @ViewChild('supplementsModal') supplementsModalTemplate!: TemplateRef<any>;

  selectedQuantities: Record<string, number> = {};

  bookedUnits: {
    unit: AvailabilityGetResource;
    quantity: number;
    supplements: SupplementItem[];
    searchParams: AvailabilityPostResource;
  }[] = [];


  modalRef?: BsModalRef;
  activeUnit?: AvailabilityGetResource;
  supplementsPerUnit = new Map<string, SupplementItem[]>();

  minSearchDate: Dayjs = dayjs();
  isChildrenPopoverOpen: boolean = false;


  constructor(
    private readonly fb: FormBuilder,
    private readonly availabilityApi: AvailabilityApiService,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService,
    private modalService: BsModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check for preserved data AVANT la création du form
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state || history.state;

    this.form = this.fb.group({
      party: [],
      segmentId: [],
      subSegmentId: [],
      adults: [1],
      childrenAges: this.fb.array([])
    });

    // Restore all data if exist
    if (state?.preserveData && state?.preservedAvailabilityData) {
      const preserved = state.preservedAvailabilityData;

      // Restore form
      this.form.patchValue(preserved.formValue);

      // Restaurer FormArrays for children
      if (preserved.formValue.childrenAges?.length > 0) {
        preserved.formValue.childrenAges.forEach((age: number) => {
          this.childrenAges.push(this.fb.control(age, [Validators.required, Validators.min(0), Validators.max(17)]));
        });
      }

      // Restore other data
      this.dateRange = preserved.dateRange;
      this.availableUnits = preserved.availableUnits || [];
      this.isSearchPerformed = preserved.isSearchPerformed || false;
      this.selectedQuantities = preserved.selectedQuantities || {};
      this.popoverChildrenCount = preserved.popoverChildrenCount || 0;

      // Restore supplements per unit
      if (preserved.supplementsPerUnit) {
        this.supplementsPerUnit = new Map(Object.entries(preserved.supplementsPerUnit));
      }

      // Restore bookedUnits
      if (state.bookedUnits) {
        this.bookedUnits = state.bookedUnits;
      }
    }
  }

  toggleChildrenPopover(): void {
    this.isChildrenPopoverOpen = !this.isChildrenPopoverOpen;
  }

  onPartyUpdated(party: PartyItemGetModel | null): void {
    if (party?.segment) {
      const segment = party.segment;
      const parent = segment.parent;

      if (parent) {
        this.form.patchValue({
          segmentId: parent,
          subSegmentId: segment
        });
      } else {
        this.form.patchValue({
          segmentId: segment,
          subSegmentId: null
        });
      }
    } else {
      this.form.patchValue({
        segmentId: null,
        subSegmentId: null
      });
    }
  }

  get childrenAges(): FormArray<FormControl<number | null>> {
    return this.form.get('childrenAges') as FormArray<FormControl<number | null>>;
  }

  onPopoverChildrenCountChange(newCount: number | null): void {
    newCount = newCount || 0;
    this.popoverChildrenCount = newCount;

    const currentCount = this.childrenAges.length;

    if (newCount > currentCount) {
      for (let i = currentCount; i < newCount; i++) {
        this.childrenAges.push(
          this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(17)])
        );
      }
    } else if (newCount < currentCount) {
      for (let i = currentCount - 1; i >= newCount; i--) {
        this.childrenAges.removeAt(i);
      }
    }
    this.childrenAges.markAllAsTouched();
  }

  incrementQuantity(unit: AvailabilityGetResource): void {
    const current = this.selectedQuantities[unit.id] ?? 1;
    if (current < unit.inventory.availableCount) {
      this.selectedQuantities[unit.id] = current + 1;
    }
  }

  decrementQuantity(unit: AvailabilityGetResource): void {
    const current = this.selectedQuantities[unit.id] ?? 1;
    if (current > 1) {
      this.selectedQuantities[unit.id] = current - 1;
    }
  }

  openSupplementsModal(unit: AvailabilityGetResource): void {
    this.activeUnit = unit;

    if (!this.supplementsPerUnit.has(unit.id)) {
      this.supplementsPerUnit.set(unit.id, this.getDefaultSupplementOptions());
    }

    this.modalRef = this.modalService.show(this.supplementsModalTemplate, {
      class: 'modal-lg'
    });
  }


  getDefaultSupplementOptions(): SupplementItem[] {
    return [
      {
        label: this.translateService.instant('availability.list.supplements.breakfast.label'),
        description: this.translateService.instant('availability.list.supplements.breakfast.description'),
        price: 120,
        selected: false
      },
      {
        label: this.translateService.instant('availability.list.supplements.lunch.label'),
        description: this.translateService.instant('availability.list.supplements.lunch.description'),
        price: 180,
        selected: false
      },
      {
        label: this.translateService.instant('availability.list.supplements.dinner.label'),
        description: this.translateService.instant('availability.list.supplements.dinner.description'),
        price: 250,
        selected: false
      },
      {
        label: this.translateService.instant('availability.list.supplements.allInclusive.label'),
        description: this.translateService.instant('availability.list.supplements.allInclusive.description'),
        price: 450,
        selected: false
      },
      {
        label: this.translateService.instant('availability.list.supplements.halfBoard.label'),
        description: this.translateService.instant('availability.list.supplements.halfBoard.description'),
        price: 320,
        selected: false
      },
      {
        label: this.translateService.instant('availability.list.supplements.spaAccess.label'),
        description: this.translateService.instant('availability.list.supplements.spaAccess.description'),
        price: 200,
        selected: false
      }
    ];
  }


  validateSupplements(): void {
    const list = this.supplementsPerUnit.get(this.activeUnit?.id || '');
    const selected = list?.filter(opt => opt.selected) || [];
    console.log('Selected supplements for', this.activeUnit?.name, selected);
    this.modalRef?.hide();
  }


  getSupplementsTotal(unit: AvailabilityGetResource): number {
    const list = this.supplementsPerUnit.get(unit.id) || [];
    return list.filter(opt => opt.selected).reduce((total, item) => total + item.price, 0);
  }

  getSelectedSupplementsTotal(booked: {
    supplements: SupplementItem[];
    quantity: number;
  }): number {
    const totalPerUnit = booked.supplements
      .filter(s => s.selected)
      .reduce((sum, s) => sum + s.price, 0);

    return totalPerUnit * booked.quantity;
  }


  onSearch(): void {

    if (this.dateRange?.startDate && this.dateRange?.endDate && !this.dateRange.endDate.isAfter(this.dateRange.startDate, 'day')) {
      this.toastrService.warning(
        this.translateService.instant('availability.list.notifications.invalidDateRange.message'),
        this.translateService.instant('availability.list.notifications.invalidDateRange.title')
      );
      return;
    }

    if (!this.dateRange?.startDate || !this.dateRange?.endDate) {
      this.toastrService.warning(
        this.translateService.instant('availability.list.notifications.dateRequired.message'),
        this.translateService.instant('availability.list.notifications.dateRequired.title')
      );
      return;
    }

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      console.log('Form is invalid:', this.form.errors, this.form.controls);
      this.toastrService.warning(
        this.translateService.instant('availability.list.notifications.formInvalid.message'),
        this.translateService.instant('availability.list.notifications.formInvalid.title')
      );
      return;
    }

    const ageCounts = new Map<number, number>();

    for (const age of this.childrenAges.value) {
      if (age != null) {
        ageCounts.set(age, (ageCounts.get(age) || 0) + 1);
      }
    }

    const childrenPayload = Array.from(ageCounts.entries()).map(([age, quantity]) => ({ age, quantity }));

    const raw = this.form.value;

    const payload: AvailabilityPostResource = {
      party: raw.party,
      checkinDate: this.dateRange.startDate.format('DD-MM-YYYY'),
      checkoutDate: this.dateRange.endDate.format('DD-MM-YYYY'),
      segmentId: raw.segmentId?.id ?? null,
      subSegmentId: raw.subSegmentId?.id ?? null,
      guests: {
        adults: raw.adults,
        children: childrenPayload
      }
    };

    this.availabilityApi.getAvailableUnits(payload).subscribe({
      next: (res) => {
        this.availableUnits = res.content ?? [];
        this.isSearchPerformed = true;
        this.firstCallDone = true;

        this.selectedQuantities = {};
        this.supplementsPerUnit.clear();

      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastrService.warning(
          this.translateService.instant('availability.list.notifications.error.message'),
          this.translateService.instant('availability.list.notifications.error.title')
        );
        this.firstCallDone = true;
      }
    });
  }

  bookUnit(unit: AvailabilityGetResource): void {
    const quantity = this.selectedQuantities[unit.id] || 1;
    const supplements = this.supplementsPerUnit.get(unit.id) || [];

    const raw = this.form.value;
    const ageCounts = new Map<number, number>();
    for (const age of this.childrenAges.value) {
      if (age != null) {
        ageCounts.set(age, (ageCounts.get(age) || 0) + 1);
      }
    }
    const childrenPayload = Array.from(ageCounts.entries()).map(([age, quantity]) => ({ age, quantity }));

    const searchParams: AvailabilityPostResource = {
      party: raw.party,
      checkinDate: this.dateRange?.startDate.format('DD-MM-YYYY') ?? '',
      checkoutDate: this.dateRange?.endDate.format('DD-MM-YYYY') ?? '',
      segmentId: raw.segmentId?.id ?? '',
      subSegmentId: raw.subSegmentId?.id ?? '',
      guests: {
        adults: raw.adults,
        children: childrenPayload
      }
    };

    this.bookedUnits.push({ unit, quantity, supplements, searchParams });
  }

  removeBookedUnit(index: number): void {
    this.bookedUnits.splice(index, 1);
  }

  continueBooking(): void {
    console.log('📦 Booking Recap Payload:', this.bookedUnits);
    this.router.navigate(['/bookings/reservations/booking'], {
      state: {
        bookedUnits: this.bookedUnits,
        // Preserve all Data
        preservedAvailabilityData: {
          formValue: this.form.getRawValue(),
          dateRange: this.dateRange,
          availableUnits: this.availableUnits,
          isSearchPerformed: this.isSearchPerformed,
          selectedQuantities: this.selectedQuantities,
          supplementsPerUnit: Object.fromEntries(this.supplementsPerUnit),
          popoverChildrenCount: this.popoverChildrenCount
        },
        preservedBookingData: history.state?.preservedBookingData
      }
    });
  }

  ngOnDestroy(): void {
  }
}

