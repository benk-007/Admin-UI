import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormLabelDirective,
  FormSelectDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  RowComponent
} from '@coreui/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { AvailabilityGetResource } from '../../models/availability/get/availability-get.model';
import { AvailabilityPostResource } from '../../models/availability/post/availability-post.model';
import { SupplementItem } from '../../models/supplement/commons/supplement-item.model';
import { PaymentMethodEnum } from '../../models/booking/enums/payment-method.enum';
import { BookingPostModel } from '../../models/booking/post/booking-post.model';
import { SelectedRoomModel } from '../../models/booking/selected-room.model';
import { PartyItemGetModel } from '../../../crm/models/party/party-item-get.model';
import { PartySelectComponent } from '../../../../shared/components/party-select/party-select.component';

interface BookedUnit {
  unit: AvailabilityGetResource;
  quantity: number;
  supplements: SupplementItem[];
  searchParams: AvailabilityPostResource;
}

const LOCAL_STORAGE_RECAP_KEY = 'availabilityRecap';
const LOCAL_STORAGE_BOOKING_FORM_KEY = 'bookingFormState';
const LOCAL_STORAGE_ROOM_RATES_KEY = 'bookingEditedRates';


@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ReactiveFormsModule,
    FormsModule,
    FormLabelDirective,
    FormControlDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    ButtonDirective,
    TranslatePipe,
    PartySelectComponent
  ],
  standalone: true
})
export class BookingComponent implements OnInit {

  bookingForm: FormGroup;
  bookedUnits: BookedUnit[] = [];
  selectedRooms: SelectedRoomModel[] = [];

  // Payment methods for dropdown
  paymentMethods = [
    { value: PaymentMethodEnum.CREDIT_CARD, key: 'booking.guaranteeMethod.creditCard' },
    { value: PaymentMethodEnum.CASH, key: 'booking.guaranteeMethod.cash' },
    { value: PaymentMethodEnum.BANK_TRANSFER, key: 'booking.guaranteeMethod.bankTransfer' }
  ];

  // State flags
  showGuaranteeAmount = false;
  selectedParty: PartyItemGetModel | null = null;
  hasPartyFromPreviousPage = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService
  ) {
    // Initialize form
    this.bookingForm = this.fb.group({
      party: [null],
      guestName: ['', [Validators.required]],
      email: [''],
      mobile: [''],
      paymentMethod: [''],
      guaranteeAmount: [''],
      specialNotes: ['']
    });
  }

  ngOnInit(): void {
    // Retrieve data from router state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state || history.state;

    if (state?.bookedUnits) {
      const savedState = localStorage.getItem(LOCAL_STORAGE_BOOKING_FORM_KEY);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          this.bookingForm.patchValue(parsed.formValue || {});
          this.selectedParty = parsed.selectedParty || null;
          this.showGuaranteeAmount = parsed.showGuaranteeAmount || false;

          if (this.selectedParty) {
            this.onPartySelected(this.selectedParty);
          }
        } catch (e) {
          console.error('Failed to parse booking form from localStorage', e);
          localStorage.removeItem(LOCAL_STORAGE_BOOKING_FORM_KEY);
        }
      }
      this.bookingForm.valueChanges.subscribe(() => this.persistFormToStorage());

      this.bookedUnits = state.bookedUnits;
      this.processBookedUnits();
      this.restoreEditedRates();

      // Check if party was selected in previous page
      if (this.bookedUnits.length > 0 && this.bookedUnits[0].searchParams.party) {
        this.hasPartyFromPreviousPage = true;
        const partyFromPrevious = this.bookedUnits[0].searchParams.party as unknown as PartyItemGetModel;
        if (!savedState) {
          this.bookingForm.patchValue({ party: partyFromPrevious });
          this.selectedParty = partyFromPrevious;
          this.onPartySelected(partyFromPrevious);
        }
      }

      // Restore all data from bookingForm
      if (state.preservedBookingData) {
        const preserved = state.preservedBookingData;
        this.bookingForm.patchValue(preserved.formValue);
        this.selectedParty = preserved.selectedParty;
        this.showGuaranteeAmount = preserved.showGuaranteeAmount;

        if (this.selectedParty) {
          this.onPartySelected(this.selectedParty);
        }
      }
    } else {
      this.router.navigate(['/bookings/reservations/create']);
      return;
    }

    // Listen to payment method changes
    this.bookingForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      this.showGuaranteeAmount = !!method;
      if (!method) {
        this.bookingForm.patchValue({ guaranteeAmount: '' });
      }
    });
  }

  onContactFieldChange(field: 'email' | 'mobile'): void {
    this.bookingForm.get(field)?.enable();
    this.persistFormToStorage();
  }

  private restoreEditedRates(): void {
    const raw = localStorage.getItem(LOCAL_STORAGE_ROOM_RATES_KEY);
    if (!raw) return;

    try {
      const editedRates: { unitId: string; rate: number }[] = JSON.parse(raw);
      for (let room of this.selectedRooms) {
        const match = editedRates.find(r => r.unitId === room.unitId);
        if (match) {
          room.nightlyRate = match.rate;
          room.total = match.rate * room.nights;
        }
      }
    } catch (e) {
      console.warn('Invalid edited rate data in localStorage');
      localStorage.removeItem(LOCAL_STORAGE_ROOM_RATES_KEY);
    }
  }


  private persistFormToStorage(): void {
    const formValue = this.bookingForm.getRawValue();
    const stateToSave = {
      formValue,
      selectedParty: this.selectedParty,
      showGuaranteeAmount: this.showGuaranteeAmount
    };
    localStorage.setItem(LOCAL_STORAGE_BOOKING_FORM_KEY, JSON.stringify(stateToSave));
  }

  private persistEditedRates(): void {
    const rates = this.selectedRooms.map(room => ({
      roomId: room.unitId,
      rate: room.nightlyRate
    }));

    localStorage.setItem(LOCAL_STORAGE_ROOM_RATES_KEY, JSON.stringify(rates));
  }


  // Process booked units into selected rooms format
  private processBookedUnits(): void {
    this.selectedRooms = [];

    this.bookedUnits.forEach(bookedUnit => {
      const unit = bookedUnit.unit;
      const searchParams = bookedUnit.searchParams;

      // Calculate nights between dates
      const checkinDate = new Date(searchParams.checkinDate.split('-').reverse().join('-'));
      const checkoutDate = new Date(searchParams.checkoutDate.split('-').reverse().join('-'));
      const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));

      // Create room entry for each quantity
      for (let i = 0; i < bookedUnit.quantity; i++) {
        const selectedRoom: SelectedRoomModel = {
          unitId: unit.id,
          unitName: unit.name,
          checkinDate: searchParams.checkinDate,
          checkoutDate: searchParams.checkoutDate,
          nights: nights,
          nightlyRate: unit.price.nightlyRate,
          total: unit.price.totalAmount,
          quantity: 1,
          adults: searchParams.guests.adults,
          children: searchParams.guests.children.reduce((sum, child) => sum + child.quantity, 0)
        };

        this.selectedRooms.push(selectedRoom);
      }
    });
  }

  // Handle party selection
  onPartySelected(party: PartyItemGetModel | null): void {
    this.selectedParty = party;

    if (party?.contact) {
      // Auto-fill contact fields and make them readonly
      const currentEmail = this.bookingForm.get('email')?.value;
      const currentMobile = this.bookingForm.get('mobile')?.value;

      // fill email only if empty
      if (!currentEmail && party.contact.email) {
        this.bookingForm.patchValue({ email: party.contact.email });
        this.bookingForm.get('email')?.disable();
      }

      // fill mobile only if empty
      if (!currentMobile && party.contact.mobile) {
        this.bookingForm.patchValue({ mobile: party.contact.mobile });
        this.bookingForm.get('mobile')?.disable();
      }
    } else {
      // Re-enable fields if no party
      this.bookingForm.get('email')?.enable();
      this.bookingForm.get('mobile')?.enable();
    }
    this.persistFormToStorage();
  }

  onTariffEdit(index: number, event: any): void {
    const newRate = parseFloat(event.target.textContent);
    if (newRate > 0) {
      this.selectedRooms[index].nightlyRate = newRate;
      this.selectedRooms[index].total = newRate * this.selectedRooms[index].nights;

      this.persistEditedRates();
    }
  }

  // Calculate total amount
  getTotalAmount(): number {
    return this.selectedRooms.reduce((total, room) => total + room.total, 0);
  }

  protected formatDate(dateString: string): string {
    return dateString.replace(/-/g, '/');
  }

  // Handle form submission - Save as Quote
  saveAsQuote(): void {
    if (this.bookingForm.get('guestName')?.invalid) {
      this.toastrService.warning(
        this.translateService.instant('booking.notifications.incompleteForm.message'),
        this.translateService.instant('booking.notifications.incompleteForm.title')
      );
      return;
    }

    const bookingData = this.createBookingPayload();
    console.log('💾 Save as Quote:', bookingData);

    // TODO: Call API to save as quote
    this.toastrService.success(
      this.translateService.instant('booking.notifications.quoteSaved.message'),
      this.translateService.instant('booking.notifications.quoteSaved.title')
    );

    localStorage.removeItem(LOCAL_STORAGE_RECAP_KEY);
    localStorage.removeItem(LOCAL_STORAGE_BOOKING_FORM_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ROOM_RATES_KEY);

  }

  // Handle form submission - Confirm Reservation
  confirmReservation(): void {
    if (this.bookingForm.get('guestName')?.invalid) {
      this.toastrService.warning(
        this.translateService.instant('booking.notifications.incompleteForm.message'),
        this.translateService.instant('booking.notifications.incompleteForm.title')
      );
      return;
    }

    const bookingData = this.createBookingPayload();
    console.log('✅ Confirm Reservation:', bookingData);

    // TODO: Call API to confirm reservation
    this.toastrService.success(
      this.translateService.instant('booking.notifications.reservationConfirmed.message'),
      this.translateService.instant('booking.notifications.reservationConfirmed.title')
    );

    localStorage.removeItem(LOCAL_STORAGE_RECAP_KEY);
    localStorage.removeItem(LOCAL_STORAGE_BOOKING_FORM_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ROOM_RATES_KEY);

  }

  // Create booking payload
  private createBookingPayload(): BookingPostModel {
    const formValue = this.bookingForm.getRawValue(); // Use getRawValue to include disabled fields

    return {
      party: this.selectedParty?.id,
      guestName: formValue.guestName,
      email: formValue.email,
      mobile: formValue.mobile,
      units: this.selectedRooms,
      paymentMethod: formValue.paymentMethod,
      guaranteeAmount: formValue.guaranteeAmount ? parseFloat(formValue.guaranteeAmount) : undefined,
      specialNotes: formValue.specialNotes,
      totalAmount: this.getTotalAmount()
    };
  }
}
