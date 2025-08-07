import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators
} from '@angular/forms';
import {
  ButtonDirective, ColComponent, FormControlDirective, FormDirective,
  FormFeedbackComponent, FormLabelDirective, RowComponent,
} from '@coreui/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { PartyService } from '../../services/party.service';
import { CountrySelectComponent } from '../../../../shared/components/country-select/country-select.component';
import { NgxIntlTelInputModule, CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
import { noNumbersValidator } from '../../../../shared/validators/no-number.validator';
import {TooltipDirective} from "ngx-bootstrap/tooltip";
import { NgxDaterangepickerBootstrapDirective} from 'ngx-daterangepicker-bootstrap';
import moment from 'moment';
import {NgIf} from "@angular/common";
import dayjs from "dayjs";
import {PartyItemGetModel} from '../../models/get/party-item-get.model';
import {PartyItemPatchModel} from '../../models/patch/party-patch.model';
import {SegmentSelectComponent} from '../../../../shared/components/segment-select/segment-select.component';
import {PartyTypeEnum} from '../../models/enums/party-type.enum';

@Component({
  selector: 'app-guest-edit',
  standalone: true,
  imports: [
    RowComponent, ColComponent, FormControlDirective, FormDirective,
    FormFeedbackComponent, FormLabelDirective, FormsModule,
    ReactiveFormsModule, TranslatePipe, CountrySelectComponent,
    NgxIntlTelInputModule,
    ButtonDirective, RouterOutlet, TooltipDirective, RouterLink, RouterLinkActive,
    NgxDaterangepickerBootstrapDirective, NgIf, SegmentSelectComponent
  ],
  templateUrl: './guest-edit.component.html',
  styleUrl: './guest-edit.component.scss'
})
export class GuestEditComponent implements OnDestroy {

  guestForm: FormGroup;
  partyId!: string;
  guest!: PartyItemGetModel;
  isLoading = true;
  private subscriptions: Subscription[] = [];

  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;
  protected readonly partyTypeEnum = PartyTypeEnum;

  datePickerLocale = {
    format: 'DD-MM-YYYY',
    applyLabel: this.translateService.instant('commons.apply'),
    cancelLabel: this.translateService.instant('commons.cancel'),
  };

  birthDate: { startDate: moment.Moment | null, endDate: moment.Moment | null } = { startDate: null, endDate: null };
  isNavigating = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly partyService: PartyService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService,
    private readonly router: Router
  ) {
    this.guestForm = this.fb.group({
      type: ['GUEST', Validators.required],

      // GUEST
      firstName: [null],
      lastName: [null],

      // COMPANY
      name: [null],
      segmentId: [null],

      birthDate: [null],
      address: this.fb.group({
        street1: [null],
        street2: [null],
        postCode: [null],
        city: [null, noNumbersValidator()],
        country: [null]
      }),
      contact: this.fb.group({
        email: [null, [Validators.required, Validators.email]],
        mobile: [null]
      }),
    });

    this.guestForm.get('type')?.valueChanges.subscribe((type: PartyTypeEnum) => {
      if (type === PartyTypeEnum.GUEST) {
        this.guestForm.get('firstName')?.setValidators([Validators.required]);
        this.guestForm.get('lastName')?.setValidators([Validators.required]);
        this.guestForm.get('name')?.clearValidators();
        this.guestForm.get('segmentId')?.clearValidators();
      } else if (type === PartyTypeEnum.COMPANY) {
        this.guestForm.get('firstName')?.clearValidators();
        this.guestForm.get('lastName')?.clearValidators();
        this.guestForm.get('name')?.setValidators([Validators.required]);
        this.guestForm.get('segmentId')?.setValidators([Validators.required]);
      }

      this.guestForm.get('firstName')?.updateValueAndValidity();
      this.guestForm.get('lastName')?.updateValueAndValidity();
      this.guestForm.get('name')?.updateValueAndValidity();
      this.guestForm.get('segmentId')?.updateValueAndValidity();
    });

    this.subscriptions.push(
      combineLatest(
        this.activatedRoute.pathFromRoot.map(route => route.paramMap)
      ).subscribe(paramMaps => {
        const partyId = paramMaps
          .map(paramMap => paramMap.get('id'))
          .find(id => id !== null);
        if (partyId) {
          this.partyId = partyId;
          this.retrieveGuest();
        }
      })
    );
  }

  private retrieveGuest() {
    this.subscriptions.push(
      this.partyService.getPartyById(this.partyId).subscribe({
        next: (data) => {

          console.log('Guest loaded successfully:', data);
          this.guest = data;
          if (this.guest.birthDate) {
            const parsedDate = moment(this.guest.birthDate, 'YYYY-MM-DD');
            this.birthDate = { startDate: parsedDate, endDate: parsedDate };
            this.guestForm.get('birthDate')?.setValue(parsedDate.toDate());
          }

          this.guestForm.patchValue({
            type: this.guest.type,
            firstName: this.guest.firstName,
            lastName: this.guest.lastName,
            name: this.guest.name,
            segmentId: this.guest.segment,
            address: this.guest.address,
            contact: this.guest.contact
          });


          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load guest:', err);
          this.isLoading = false;
        }
      })
    );
  }

  onDateChange(event: any) {
    console.log('Date change event:', event);
    if (event.startDate) {
      this.birthDate = event;
      this.guestForm.get('birthDate')?.setValue(event.startDate?.toDate());
    } else {
      this.birthDate = { startDate: null, endDate: null };
      this.guestForm.get('birthDate')?.setValue(null);
    }
  }

  submit() {
    if (this.guestForm.invalid) {
      this.toastrService.warning(this.translateService.instant('commons.form.validation-errors'));
      return;
    }

    const formValue = this.guestForm.value;

    const payload: PartyItemPatchModel = {
      birthDate: this.birthDate.startDate
        ? this.birthDate.startDate.format('YYYY-MM-DD')
        : undefined,
      address: formValue.address,
      contact: {
        email: formValue.contact.email,
        mobile: formValue.contact.mobile?.e164Number
      }
    };

    if (formValue.type === 'GUEST') {
      payload.firstName = formValue.firstName;
      payload.lastName = formValue.lastName;
    } else if (formValue.type === 'COMPANY') {
      payload.name = formValue.name;
      payload.segmentId = formValue.segmentId?.id;
    }

    console.log('PATCH Payload being sent:', payload);

    this.subscriptions.push(
      this.partyService.patchPartyById(payload, this.partyId).subscribe({
        next: () => {
          console.log('Guest updated successfully.');
          this.toastrService.info(
            this.translateService.instant('guests.edit-guest.notifications.info.message'),
            this.translateService.instant('guests.edit-guest.notifications.info.title')
          );
        },
        error: (err) => {
          console.error('Failed to update guest:', err);
          this.toastrService.error(
            this.translateService.instant('guests.edit-guest.notifications.error.message'),
            this.translateService.instant('guests.edit-guest.notifications.error.title')
          );
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.isNavigating = true;
  }
}
