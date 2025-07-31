import {Component, effect, OnInit, signal, TemplateRef, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { BookingApiService } from '../../services/booking-api.service';
import { BookingGetModel } from '../../models/booking/get/booking-get.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  ButtonDirective,
  FormLabelDirective,
  FormControlDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective
} from '@coreui/angular';
import { PartySelectComponent } from '../../../../shared/components/party-select/party-select.component';
import { PartyItemGetModel } from '../../../crm/models/party/party-item-get.model';
import {NgForOf, NgIf} from '@angular/common';
import {BookingItemGetModel} from '../../models/booking/get/booking-item-get.model';
import {BookingPatchModel} from '../../models/booking/patch/booking-patch.model';
import {SupplementItem} from '../../models/supplement/commons/supplement-item.model';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  standalone: true,
  providers: [BsModalService],
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
    TranslatePipe,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    NgIf,
    ButtonDirective,
    NgForOf
  ]
})
export class BookingComponent implements OnInit {

  bookingForm!: FormGroup;
  bookingId: string | null = null;
  bookingData: BookingGetModel | null = null;
  selectedParty: PartyItemGetModel | null = null;

  patchPayload = signal<Partial<BookingPatchModel>>({});

  selectedItems: BookingItemGetModel[] = [];

  @ViewChild('supplementsModalTemplate') supplementsModalTemplate!: TemplateRef<any>;
  modalRef?: BsModalRef;
  activeItemId: string | null = null;
  supplementsForEdit: SupplementItem[] = [];

  paymentMethods = [
    { value: 'CREDIT_CARD', key: 'booking.guaranteeMethod.creditCard' },
    { value: 'CASH', key: 'booking.guaranteeMethod.cash' },
    { value: 'BANK_TRANSFER', key: 'booking.guaranteeMethod.bankTransfer' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingApiService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private readonly translateService: TranslateService,
  ) {
    effect(() => {
      const patch = this.patchPayload();
      if (this.bookingId && Object.keys(patch).length > 0) {
        this.bookingService.patchBooking(this.bookingId, patch).subscribe({
          next: () => {
            this.toastrService.success(
              this.translate.instant('booking.notifications.patchSuccess.message'),
              this.translate.instant('booking.notifications.patchSuccess.title')
            );
          },
          error: () => {
            this.toastrService.error(
              this.translate.instant('booking.notifications.patchError.message'),
              this.translate.instant('booking.notifications.patchError.title')
            );
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      party: [null],
      guestName: ['', Validators.required],
      email: ['', Validators.email],
      mobile: ['', Validators.pattern(/^\+?\d{8,15}$/)],
      paymentMethod: [''],
      guaranteeAmount: [''],
      specialNotes: ['']
    });

    this.bookingId = this.route.snapshot.paramMap.get('id');

    if (!this.bookingId) {
      this.router.navigate(['/bookings/reservations/create']);
      return;
    }

    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: (res) => {
        this.bookingData = res;

        this.bookingForm.patchValue({
          party: res.party,
          guestName: res.guestName,
          email: res.party?.contact?.email ?? '',
          mobile: res.party?.contact?.mobile ?? '',
          paymentMethod: res.paymentMethod,
          guaranteeAmount: res.guaranteeAmount,
          specialNotes: res.specialNotes
        });

        this.selectedParty = res.party;

        this.bookingForm.get('party')?.disable();
        if (res.party?.contact?.email) {
          const emailControl = this.bookingForm.get('email');
          emailControl?.setValue(res.party.contact.email);
          emailControl?.disable();
        }

        if (res.party?.contact?.mobile) {
          const mobileControl = this.bookingForm.get('mobile');
          mobileControl?.setValue(res.party.contact.mobile);
          mobileControl?.disable();
        }

        this.selectedItems = res.items;

        this.setupPatchTriggers();
      },
      error: () => {
        this.toastrService.error(
          this.translate.instant('booking.notifications.bookingLoadFailed.message'),
          this.translate.instant('booking.notifications.bookingLoadFailed.title')
        );
        this.router.navigate(['/bookings/reservations/create']);
      }
    });
  }

  setupPatchTriggers(): void {
    this.bookingForm.get('guestName')?.valueChanges.subscribe(value => {
      this.patchPayload.set({ guestName: value });
    });

    const emailCtrl = this.bookingForm.get('email');
    if (emailCtrl?.enabled) {
      emailCtrl.valueChanges.subscribe(value => {
        this.patchPayload.set({ email: value });
      });
    }

    const mobileCtrl = this.bookingForm.get('mobile');
    if (mobileCtrl?.enabled) {
      mobileCtrl.valueChanges.subscribe(value => {
        this.patchPayload.set({ mobile: value });
      });
    }

    this.bookingForm.get('paymentMethod')?.valueChanges.subscribe(value => {
      this.patchPayload.set({ paymentMethod: value });
    });

    this.bookingForm.get('guaranteeAmount')?.valueChanges.subscribe(value => {
      this.patchPayload.set({ guaranteeAmount: parseFloat(value) || 0 });
    });

    this.bookingForm.get('specialNotes')?.valueChanges.subscribe(value => {
      this.patchPayload.set({ specialNotes: value });
    });
  }

  getSupplementsTotal(item: BookingItemGetModel): number {
    return item.supplements?.reduce((sum, s) => sum + s.price, 0) || 0;
  }

  getTotalAmount(): number {
    return this.selectedItems.reduce((sum, room) => sum + room.total, 0);
  }

  onRateChange(itemId: string, event: Event): void {
    const span = event.target as HTMLElement;
    const newRate = parseFloat(span.textContent?.trim() || '');

    if (isNaN(newRate) || newRate <= 0) return;

    const item = this.selectedItems.find(i => i.id === itemId);
    if (!item) return;

    item.nightlyRate = newRate;

    const patch: BookingPatchModel = {
      nightlyRate: newRate
    };

    // Now we call the patch with the itemId in the URL
    this.bookingService.patchBooking(itemId, patch).subscribe({
      next: () => {
        this.toastrService.success(
          this.translate.instant('booking.notifications.patchSuccess.message'),
          this.translate.instant('booking.notifications.patchSuccess.title')
        );
      },
      error: () => {
        this.toastrService.error(
          this.translate.instant('booking.notifications.patchError.message'),
          this.translate.instant('booking.notifications.patchError.title')
        );
      }
    });
  }

  formatDate(dateString: string): string {
    return dateString.replace(/-/g, '/');
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


  openSupplementsModal(item: BookingItemGetModel): void {
    this.activeItemId = item.id;

    const allOptions = this.getDefaultSupplementOptions();
    const selected = item.supplements || [];

    for (const option of allOptions) {
      if (selected.some(s => s.label === option.label)) {
        option.selected = true;
      }
    }

    this.supplementsForEdit = allOptions;
    this.modalRef = this.modalService.show(this.supplementsModalTemplate, {
      class: 'modal-lg'
    });
  }

  validateSupplements(): void {
    if (!this.activeItemId) return;

    const selectedSupps = this.supplementsForEdit.filter(s => s.selected).map(({ label, description, price }) => ({ label, description, price }));

    const patch: BookingPatchModel = {
      supplements: selectedSupps
    };

    this.bookingService.patchBooking(this.activeItemId, patch).subscribe({
      next: () => {
        this.toastrService.success(
          this.translate.instant('booking.notifications.patchSuccess.message'),
          this.translate.instant('booking.notifications.patchSuccess.title')
        );
        this.modalRef?.hide();

        // Update local display
        const item = this.selectedItems.find(i => i.id === this.activeItemId);
        if (item) item.supplements = selectedSupps;
      },
      error: () => {
        this.toastrService.error(
          this.translate.instant('booking.notifications.patchError.message'),
          this.translate.instant('booking.notifications.patchError.title')
        );
      }
    });
  }

  confirmReservation(): void {
    if (!this.bookingId) return;

    const patch: BookingPatchModel = {
      status: 'CONFIRMED'
    };

    this.bookingService.patchBooking(this.bookingId, patch).subscribe({
      next: () => {
        this.toastrService.success(
          this.translate.instant('booking.notifications.confirmationSuccess.message'),
          this.translate.instant('booking.notifications.confirmationSuccess.title')
        );

        this.router.navigate(['/bookings/reservations']);
      },
      error: () => {
        this.toastrService.error(
          this.translate.instant('booking.notifications.confirmationError.message'),
          this.translate.instant('booking.notifications.confirmationError.title')
        );
      }
    });
  }

}
