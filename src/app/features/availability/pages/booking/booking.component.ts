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
    FormSelectDirective,
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
      this.bookedUnits = state.bookedUnits;
      this.processBookedUnits();

      // Check if party was selected in previous page
      if (this.bookedUnits.length > 0 && this.bookedUnits[0].searchParams.party) {
        this.hasPartyFromPreviousPage = true;
        const partyFromPrevious = this.bookedUnits[0].searchParams.party as unknown as PartyItemGetModel;
        this.bookingForm.patchValue({ party: partyFromPrevious });
        this.selectedParty = partyFromPrevious;
        this.onPartySelected(partyFromPrevious);
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
          roomId: unit.id,
          roomName: unit.name,
          checkinDate: searchParams.checkinDate,
          checkoutDate: searchParams.checkoutDate,
          nights: nights,
          nightlyRate: unit.price.nightlyRate,
          total: unit.price.totalAmount,
          quantity: 1
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
      this.bookingForm.patchValue({
        email: party.contact.email || '',
        mobile: party.contact.mobile || ''
      });

      // Disable fields if they have values
      if (party.contact.email) {
        this.bookingForm.get('email')?.disable();
      }
      if (party.contact.mobile) {
        this.bookingForm.get('mobile')?.disable();
      }
    } else {
      // Re-enable fields if no party or no contact
      this.bookingForm.get('email')?.enable();
      this.bookingForm.get('mobile')?.enable();
      this.bookingForm.patchValue({
        email: '',
        mobile: ''
      });
    }
  }

  onTariffEdit(index: number, event: any): void {
    const newRate = parseFloat(event.target.textContent);
    if (newRate > 0) {
      this.selectedRooms[index].nightlyRate = newRate;
      this.selectedRooms[index].total = newRate * this.selectedRooms[index].nights;
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
  }

  // Create booking payload
  private createBookingPayload(): BookingPostModel {
    const formValue = this.bookingForm.getRawValue(); // Use getRawValue to include disabled fields

    return {
      party: this.selectedParty?.id,
      guestName: formValue.guestName,
      email: formValue.email,
      mobile: formValue.mobile,
      rooms: this.selectedRooms,
      paymentMethod: formValue.paymentMethod,
      guaranteeAmount: formValue.guaranteeAmount ? parseFloat(formValue.guaranteeAmount) : undefined,
      specialNotes: formValue.specialNotes
    };
  }

  // Navigate back to availability
  goBack(): void {
    this.router.navigate(['/bookings/reservations/create'], {
      state: {
        bookedUnits: this.bookedUnits,
        preserveData: true,
        // Passer les données du booking form
        preservedBookingData: {
          formValue: this.bookingForm.getRawValue(),
          selectedParty: this.selectedParty,
          showGuaranteeAmount: this.showGuaranteeAmount
        },
        // Récupérer et passer les données originales d'availability
        preservedAvailabilityData: history.state?.preservedAvailabilityData
      }
    });
  }
}
