import {Component, OnInit, OnDestroy, TemplateRef, ViewChild, signal} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
  FormArray,
  FormControl
} from '@angular/forms';
import { Location } from '@angular/common';

import dayjs, { Dayjs } from 'dayjs';
import {AvailabilityGetModel} from '../../models/availability/get/availability-get.model';
import {AvailabilityPostModel} from '../../models/availability/post/availability-post.model';
import {SupplementItem} from '../../models/supplement/commons/supplement-item.model';
import {BookingApiService} from '../../services/booking-api.service';
import {ButtonDirective, ColComponent, FormSelectDirective, RowComponent, SpinnerComponent} from '@coreui/angular';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
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
import {ActivatedRoute, Router} from '@angular/router';
import {BookingItemGetModel} from '../../models/booking/get/booking-item-get.model';
import {BookingPostModel} from '../../models/booking/post/booking-post.model';
import {BookingItemPostModel} from '../../models/booking/post/booking-item-post.model';

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
    DecimalPipe,
  ],
  standalone: true,
  providers: [BsModalService],
})
export class AvailabilityListComponent implements OnInit, OnDestroy {

  icons = {cilSearch}

  form!: FormGroup;

  dateRange: { startDate: Dayjs; endDate: Dayjs } | null = null;
  availableUnits: AvailabilityGetModel[] = [];
  isNavigating = false;
  popoverChildrenCount: number = 0;
  firstCallDone: boolean = true;
  @ViewChild('supplementsModal') supplementsModalTemplate!: TemplateRef<any>;

  minSearchDate: Dayjs = dayjs();
  isChildrenPopoverOpen: boolean = false;
  modalRef?: BsModalRef;
  activeUnit?: AvailabilityGetModel;

  parentBookingId = signal<string | null>(null);
  quantities = signal<Record<string, number>>({});
  bookedItems = signal<BookingItemGetModel[]>([]);

  private lastBookingContext: { partyId: string | null, segmentId: string | null, subSegmentId: string | null } = {
    partyId: null,
    segmentId: null,
    subSegmentId: null
  };


  supplementsPerUnit = new Map<string, SupplementItem[]>();

  selectedSegmentId: string | undefined = undefined;

  originalAvailability = new Map<string, number>();



  constructor(
    private readonly fb: FormBuilder,
    private readonly bookingService: BookingApiService,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      party: [],
      segmentId: [],
      subSegmentId: [],
      adults: [1],
      childrenAges: this.fb.array([])
    });
    this.form.get('segmentId')?.valueChanges.subscribe((segment: any) => {
      this.selectedSegmentId = segment?.id || segment?.uuid || null;
      this.form.get('subSegmentId')?.reset();
    });
    console.log('Selected segment ID:', this.selectedSegmentId);
  }

  get childrenAges(): FormArray<FormControl<number | null>> {
    return this.form.get('childrenAges') as FormArray<FormControl<number | null>>;
  }

  toggleChildrenPopover(): void {
    this.isChildrenPopoverOpen = !this.isChildrenPopoverOpen;
  }

  onPartyUpdated(party: PartyItemGetModel | null): void {
    const segment = party?.segment;
    if (segment?.parent) {
      this.form.patchValue({ segmentId: segment.parent, subSegmentId: segment });
    } else {
      this.form.patchValue({ segmentId: segment, subSegmentId: null });
    }
  }

  onPopoverChildrenCountChange(newCount: number | null): void {
    newCount = newCount || 0;
    const currentCount = this.childrenAges.length;
    if (newCount > currentCount) {
      for (let i = currentCount; i < newCount; i++) {
        this.childrenAges.push(this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(17)]));
      }
    } else {
      for (let i = currentCount - 1; i >= newCount; i--) {
        this.childrenAges.removeAt(i);
      }
    }
    this.childrenAges.markAllAsTouched();
  }

  incrementQuantity(unit: AvailabilityGetModel): void {
    const current = this.quantities()[unit.id] ?? 0;

    if (current < unit.inventory.availableCount) {
      const newQuantities = { ...this.quantities(), [unit.id]: current + 1 };
      this.quantities.set(newQuantities);

      const payload = this.buildBookingPayload(newQuantities);

      if (!this.parentBookingId()) {
        this.bookingService.createGroupBooking(payload).subscribe({
          next: res => {
            this.parentBookingId.set(res.id);
            this.bookedItems.set(res.items);

            this.location.replaceState(`/bookings/reservations/${res.id}/results`);
          },
          error: () => {
            this.toastrService.error(
              this.translateService.instant('availability.list.notifications.bookingCreationFailed.message'),
              this.translateService.instant('availability.list.notifications.bookingCreationFailed.title')
            );
          }
        });
      } else {
        const updatedItem = this.buildSingleBookingItem(unit, newQuantities[unit.id]);
        this.bookingService.updateBookingItems(this.parentBookingId()!, updatedItem).subscribe({
          next: () => this.refreshBooking(),
          error: () => {
            this.toastrService.error(
              this.translateService.instant('availability.list.notifications.bookingUpdateFailed.message'),
              this.translateService.instant('availability.list.notifications.bookingUpdateFailed.title')
            );
          }
        });
      }
    }
  }

  decrementQuantity(unit: AvailabilityGetModel): void {
    const current = this.quantities()[unit.id] ?? 0;

    if (current > 0) {
      const updated = { ...this.quantities() };
      if (current === 1) delete updated[unit.id];
      else updated[unit.id] = current - 1;

      this.quantities.set(updated);

      if (this.parentBookingId()) {
        if (this.parentBookingId()) {
          const updatedItem = this.buildSingleBookingItem(unit, updated[unit.id] ?? 0);
          this.bookingService.updateBookingItems(this.parentBookingId()!, updatedItem).subscribe({
            next: () => {
              this.refreshBooking();

              if (Object.keys(updated).length === 0) {
                this.parentBookingId.set(null);
                this.bookedItems.set([]);
                this.quantities.set({});
                this.location.replaceState('/bookings/reservations/create');
              }
            },
            error: () => {
              this.toastrService.error(
                this.translateService.instant('availability.list.notifications.bookingUpdateFailed.message'),
                this.translateService.instant('availability.list.notifications.bookingUpdateFailed.title')
              );
            }
          });
        }
      }
    }
  }

  openSupplementsModal(unit: AvailabilityGetModel): void {
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

  removeBookedUnit(index: number): void {
    const currentItems = this.bookedItems();
    const itemToRemove = currentItems[index];

    if (!itemToRemove?.id) return;

    this.bookingService.deleteBookingItem(itemToRemove.id).subscribe({
      next: () => {
        const updated = [...currentItems];
        updated.splice(index, 1);
        this.bookedItems.set(updated);

        const newQuantities = { ...this.quantities() };
        delete newQuantities[itemToRemove.unit.unitId];
        this.quantities.set(newQuantities);

        if (updated.length === 0) {
          this.parentBookingId.set(null);
          this.location.replaceState('/bookings/reservations/create');
        }
      },
      error: () => {
        this.toastrService.error(
          this.translateService.instant('availability.list.notifications.itemRemoveFailed.message'),
          this.translateService.instant('availability.list.notifications.itemRemoveFailed.title')
        );
      }
    });
  }


  refreshBooking(): void {
    const parentId = this.parentBookingId();
    if (!parentId) return;

    this.bookingService.getBookingById(parentId).subscribe({
      next: res => {
        this.bookedItems.set(res.items);
      },
      error: () => {
        this.toastrService.error(
          this.translateService.instant('availability.list.notifications.bookingLoadFailed.message'),
          this.translateService.instant('availability.list.notifications.bookingLoadFailed.title')
        );
      }
    });
  }

  validateSupplements(): void {
    const unitId = this.activeUnit?.id || '';
    const selected = this.supplementsPerUnit.get(this.activeUnit?.id || '')?.filter(s => s.selected) ?? [];

    console.log('Selected supplements:', selected);
    this.modalRef?.hide();

    const updated = { ...this.quantities() };
    if (unitId in updated) {
      delete updated[unitId];
      this.quantities.set(updated);
    }

    this.adjustAvailableCountsBasedOnContext();
    this.restoreQuantitiesFromBooking();
  }

  onSearch(): void {
    console.log('Parent Booking ID:', this.parentBookingId());

    if (!this.dateRange?.startDate || !this.dateRange?.endDate || !this.dateRange.endDate.isAfter(this.dateRange.startDate, 'day')) {
      this.toastrService.warning(
        this.translateService.instant('availability.list.notifications.invalidDateRange.message'),
        this.translateService.instant('availability.list.notifications.invalidDateRange.title')
      );
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) return;


    const childrenPayload = this.childrenAges.value
      .filter(age => age !== null)
      .reduce((acc, age) => {
        const found = acc.find(x => x.age === age);
        if (found) found.quantity += 1;
        else acc.push({ age, quantity: 1 });
        return acc;
      }, [] as { age: number; quantity: number }[]);

    const raw = this.form.value;
    const payload: AvailabilityPostModel = {
      party: raw.party,
      checkinDate: this.dateRange.startDate.format('DD-MM-YYYY'),
      checkoutDate: this.dateRange.endDate.format('DD-MM-YYYY'),
      segmentId: raw.segmentId?.id ?? null,
      subSegmentId: raw.subSegmentId?.id ?? null,
      guests: { adults: raw.adults, children: childrenPayload }
    };

    this.bookingService.getAvailableUnits(payload).subscribe({
      next: (res) => {
        this.availableUnits = (res.content ?? []).map(unit => {
          this.originalAvailability.set(unit.id, unit.inventory.availableCount);
          return unit;
        });
        this.adjustAvailableCountsBasedOnContext();

        this.restoreQuantitiesFromBooking();

        const currentContext = {
          partyId: this.form.value.party?.id ?? null,
          segmentId: this.form.value.segmentId?.id ?? null,
          subSegmentId: this.form.value.subSegmentId?.id ?? null
        };

        if (
          this.lastBookingContext.partyId !== currentContext.partyId ||
          this.lastBookingContext.segmentId !== currentContext.segmentId ||
          this.lastBookingContext.subSegmentId !== currentContext.subSegmentId
        ) {
          this.parentBookingId.set(null);
          this.bookedItems.set([]);
          this.quantities.set({});
          this.supplementsPerUnit.clear();
          this.location.replaceState('/bookings/reservations/create');
        }

        this.lastBookingContext = currentContext;
      },
      error: () => {
        this.toastrService.warning(
          this.translateService.instant('availability.list.notifications.error.message'),
          this.translateService.instant('availability.list.notifications.error.title')
        );
      }
    });
  }

  private rangesOverlap(start1: Dayjs, end1: Dayjs, start2: Dayjs | null, end2: Dayjs | null): boolean {
    if (!start2 || !end2) return false;
    return start1.isBefore(end2) && end1.isAfter(start2);
  }

  private adjustAvailableCountsBasedOnContext(): void {
    const raw = this.form.value;

    for (const unit of this.availableUnits) {
      const currentStart = this.dateRange?.startDate;
      const currentEnd = this.dateRange?.endDate;

      const childrenPayload = this.childrenAges.value
        .filter((age) => age !== null)
        .reduce((acc, age) => {
          const existing = acc.find((e) => e.age === age);
          if (existing) existing.quantity += 1;
          else acc.push({ age, quantity: 1 });
          return acc;
        }, [] as { age: number; quantity: number }[]);

      const currentSupplements = (this.supplementsPerUnit.get(unit.id) ?? [])
        .filter(s => s.selected)
        .map(({ label, description, price }) => ({ label, description, price }));

      const taken = this.bookedItems()
        .filter(item =>
            item.unit.unitId === unit.id &&
            this.rangesOverlap(
              dayjs(item.checkinDate),
              dayjs(item.checkoutDate),
              currentStart ?? null,
              currentEnd ?? null
            ) && (
              item.checkinDate !== currentStart?.format('YYYY-MM-DD') ||
              item.checkoutDate !== currentEnd?.format('YYYY-MM-DD') ||
              item.occupancy?.adults !== raw.adults ||
              JSON.stringify(item.occupancy?.children ?? []) !== JSON.stringify(childrenPayload) ||
              JSON.stringify(item.supplements ?? []) !== JSON.stringify(currentSupplements)
            )
        )
        .reduce((sum, item) => sum + item.quantity, 0);

      const originalCount = this.originalAvailability.get(unit.id) ?? unit.inventory.availableCount;
      unit.inventory.availableCount = Math.max(originalCount - taken, 0);
    }
  }


  private restoreQuantitiesFromBooking(): void {
    const raw = this.form.value;
    const childrenPayload = this.childrenAges.value
      .filter(age => age !== null)
      .reduce((acc, age) => {
        const found = acc.find(x => x.age === age);
        if (found) found.quantity += 1;
        else acc.push({ age, quantity: 1 });
        return acc;
      }, [] as { age: number; quantity: number }[]);

    const restoredQuantities: Record<string, number> = {};

    for (const unit of this.availableUnits) {
      const matched = this.bookedItems().find(item =>
          item.unit.unitId === unit.id &&
          item.checkinDate === this.dateRange?.startDate.format('YYYY-MM-DD') &&
          item.checkoutDate === this.dateRange?.endDate.format('YYYY-MM-DD') &&
          item.occupancy?.adults === raw.adults &&
          JSON.stringify(item.occupancy?.children ?? []) === JSON.stringify(childrenPayload)&&
          JSON.stringify(item.supplements ?? []) === JSON.stringify(
            (this.supplementsPerUnit.get(unit.id) ?? []).filter(s => s.selected)
              .map(({ label, description, price }) => ({ label, description, price }))
          )
      );

      if (matched) {
        restoredQuantities[unit.id] = matched.quantity;

        if (matched.supplements?.length && !this.supplementsPerUnit.has(unit.id)) {
          this.supplementsPerUnit.set(unit.id, matched.supplements.map(s => ({
            ...s,
            selected: true
          })));
        }
      }
    }

    this.quantities.set(restoredQuantities);
  }


  getSupplementsTotal(unit: AvailabilityGetModel): number {
    const list = this.supplementsPerUnit.get(unit.id) || [];
    return list.filter(opt => opt.selected).reduce((total, item) => total + item.price, 0);
  }

  private buildSingleBookingItem(unit: AvailabilityGetModel, quantity: number): BookingItemPostModel {
    const raw = this.form.value;

    const childrenPayload = this.childrenAges.value
      .filter((a) => a !== null)
      .reduce((acc, age) => {
        const existing = acc.find((e) => e.age === age);
        if (existing) existing.quantity += 1;
        else acc.push({ age, quantity: 1 });
        return acc;
      }, [] as { age: number; quantity: number }[]);

    return {
      unit: {
        unitId: unit.id,
        unitName: unit.name
      },
      checkinDate: this.dateRange?.startDate.format('YYYY-MM-DD') ?? '',
      checkoutDate: this.dateRange?.endDate.format('YYYY-MM-DD') ?? '',
      occupancy: {
        adults: raw.adults,
        children: [...childrenPayload]
      },
      quantity,
      nightlyRate: unit.price?.nightlyRate ?? 0,
      nights: this.dateRange?.endDate.diff(this.dateRange?.startDate, 'day') ?? 0,
      supplements: (this.supplementsPerUnit.get(unit.id) ?? [])
        .filter(s => s.selected)
        .map(({ label, description, price }) => ({ label, description, price }))
    };
  }


  private buildBookingPayload(quantities: Record<string, number>): BookingPostModel {
    const raw = this.form.value;
    const party = raw.party;

    const childrenPayload = this.childrenAges.value
      .filter((a) => a !== null)
      .reduce((acc, age) => {
        const existing = acc.find((e) => e.age === age);
        if (existing) existing.quantity += 1;
        else acc.push({ age, quantity: 1 });
        return acc;
      }, [] as { age: number; quantity: number }[]);

    return {
      party: party
        ? {
          id: party.id,
          name: party.name,
          contact: {
            email: party.contact?.email ?? '',
            mobile: party.contact?.mobile ?? ''
          }
        }
        : null,
      segmentId: raw.segmentId?.id ?? null,
      subSegmentId: raw.subSegmentId?.id ?? null,
      status: 'DRAFT',
      items: Object.entries(quantities).map(([unitId, quantity]) => {
        const unit = this.availableUnits.find((u) => u.id === unitId);
        return {
          unit: {
            unitId,
            unitName: unit?.name || ''
          },
          checkinDate: this.dateRange?.startDate.format('YYYY-MM-DD') ?? '',
          checkoutDate: this.dateRange?.endDate.format('YYYY-MM-DD') ?? '',
          occupancy: {
            adults: raw.adults,
            children: [...childrenPayload]
          },
          quantity,
          nightlyRate: unit?.price?.nightlyRate ?? 0,
          nights: this.dateRange?.endDate.diff(this.dateRange?.startDate, 'day') ?? 0,
          supplements: (this.supplementsPerUnit.get(unitId) ?? [])
            .filter(s => s.selected)
            .map(({ label, description, price }) => ({ label, description, price }))
        };
      })
    };
  }

  getSelectedSupplementsTotal(booked: BookingItemGetModel): number {
    if (!booked?.supplements?.length) return 0;

    return booked.supplements
      .filter(s => s.price != null && !isNaN(s.price))
      .reduce((total, s) => total + Number(s.price), 0);
  }

  continueBooking(): void {
    const parentId = this.parentBookingId();
    if (parentId) {
      this.router.navigate([`/bookings/reservations/${parentId}/confirm`]);
    }
  }

  ngOnDestroy(): void {
  }
}

