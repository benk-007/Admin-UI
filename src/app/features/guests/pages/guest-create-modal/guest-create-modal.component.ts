import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {ToastrService} from 'ngx-toastr';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {CountryISO, NgxIntlTelInputModule, SearchCountryField} from 'ngx-intl-tel-input';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent,
} from '@coreui/angular';
import {PartyService} from '../../services/party.service';
import {CountrySelectComponent} from '../../../../shared/components/country-select/country-select.component';
import {CommonModule} from '@angular/common';
import {NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent} from "@ng-select/ng-select";
import { NgxDaterangepickerBootstrapDirective} from 'ngx-daterangepicker-bootstrap';
import moment from 'moment';
import {DocumentTypeEnum} from '../../models/enums/document-type.enum';
import {PartyItemPostModel} from '../../models/post/party-post.model';
import {SegmentSelectComponent} from '../../../../shared/components/segment-select/segment-select.component';


@Component({
  selector: 'app-guest-create-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    RowComponent,
    ColComponent,
    ButtonDirective,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    TranslatePipe,
    CountrySelectComponent,
    CommonModule,
    NgSelectComponent,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    NgxDaterangepickerBootstrapDirective,
    FormsModule,
    SegmentSelectComponent
  ],
  templateUrl: './guest-create-modal.component.html',
  styleUrl: './guest-create-modal.component.scss'
})
export class GuestCreateModalComponent implements OnInit, OnDestroy {

  documentTypes = Object.values(DocumentTypeEnum);
  guestForm: FormGroup;
  @Output() actionConfirmed = new EventEmitter<void>();
  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;
  imageFile: File | null = null;
  private readonly subscriptions: Subscription[] = [];
  isNavigating = false;
  birthDateModel: { startDate: moment.Moment | null, endDate: moment.Moment | null } = { startDate: null, endDate: null };
  expirationDateModel: { startDate: moment.Moment | null, endDate: moment.Moment | null } = { startDate: null, endDate: null };
  @Input() type: 'GUEST' | 'COMPANY' = 'GUEST';


  constructor(
    private readonly fb: FormBuilder,
    private readonly partyService: PartyService,
    private readonly modalRef: BsModalRef,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
    this.guestForm = this.fb.group({
      // For GUEST
      firstName: [null],
      lastName: [null],

      // For COMPANY
      name: [null],
      segmentId: [null],

      birthDate: [null],
      email: [null, [Validators.required, Validators.email]],
      mobile: [null],
      country: [null],
      city: [null],
      postCode: [null],
      street1: [null],
      street2: [null],

      identityDocument: this.fb.group({
        type: [null],
        value: [null],
        expirationDate: [null],
        documentImage: [null]
      }),
    });
  }

  get idDocumentGroup(): FormGroup {
    return this.guestForm.get('identityDocument') as FormGroup;
  }

  ngOnInit(): void {
    const nameControl = this.guestForm.get('name');
    const segmentIdControl = this.guestForm.get('segmentId');
    const firstNameControl = this.guestForm.get('firstName');
    const lastNameControl = this.guestForm.get('lastName');

    if (this.type === 'COMPANY') {
      nameControl?.setValidators([Validators.required]);
      segmentIdControl?.setValidators([Validators.required]);
      firstNameControl?.clearValidators();
      lastNameControl?.clearValidators();
    } else {
      firstNameControl?.setValidators([Validators.required]);
      lastNameControl?.setValidators([Validators.required]);
      nameControl?.clearValidators();
      segmentIdControl?.clearValidators();
    }

    nameControl?.updateValueAndValidity();
    segmentIdControl?.updateValueAndValidity();
    firstNameControl?.updateValueAndValidity();
    lastNameControl?.updateValueAndValidity();
  }

  onBirthDateChange(event: any): void {
    if (event.startDate) {
      this.birthDateModel = event;
      this.guestForm.get('birthDate')?.setValue(event.startDate.toDate());
    } else {
      this.birthDateModel = { startDate: null, endDate: null };
      this.guestForm.get('birthDate')?.setValue(null);
    }
  }

  onExpirationDateChange(event: any): void {
    if (event.startDate) {
      this.expirationDateModel = event;
      this.idDocumentGroup.get('expirationDate')?.setValue(event.startDate.toDate());
    } else {
      this.expirationDateModel = { startDate: null, endDate: null };
      this.idDocumentGroup.get('expirationDate')?.setValue(null);
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toastrService.error('Please select a valid image file.');
        return;
      }
      this.imageFile = file;
      this.idDocumentGroup.get('documentImage')?.setValue(file);

      this.idDocumentGroup.updateValueAndValidity({onlySelf: true, emitEvent: false});
    }
  }

  submit(): void {
    if (!this.guestForm.valid) {
      const errors = this.guestForm.errors;
      if (errors?.['documentIncomplete']) {
        this.toastrService.error('Please complete all document fields.');
      } else if (errors?.['documentRequiredWithImage']) {
        this.toastrService.error('Please fill document details before uploading an image.');
      } else {
        this.toastrService.error('Form invalid.');
      }
      return;
    }

    const formValue = this.guestForm.value;

    const payload: PartyItemPostModel = {
      type: this.type,
      birthDate: this.birthDateModel.startDate
        ? this.birthDateModel.startDate.format('YYYY-MM-DD')
        : '',
      contact: {
        email: formValue.email,
        mobile: formValue.mobile?.e164Number || null
      },
      address: {
        country: formValue.country,
        city: formValue.city,
        postCode: formValue.postCode,
        street1: formValue.street1,
        street2: formValue.street2
      }
    };

    if (this.type === 'GUEST') {
      payload.firstName = formValue.firstName;
      payload.lastName = formValue.lastName;
    } else if (this.type === 'COMPANY') {
      payload.name = formValue.name;
      if (formValue.segmentId?.id) {
        payload.segmentId = formValue.segmentId.id;
      }
    }

    if (formValue.identityDocument?.value) {
      payload.identityDocument = {
        type: formValue.identityDocument.type,
        value: formValue.identityDocument.value,
        expirationDate: this.expirationDateModel.startDate
          ? this.expirationDateModel.startDate.format('YYYY-MM-DD')
          : ''
      };
    }

    const formData = new FormData();

    const guestJsonBlob = new Blob([JSON.stringify(payload)], {type: 'application/json'});
    formData.append('payload', guestJsonBlob);

    if (this.imageFile) {
      formData.append('file', this.imageFile);
    }

    // (for debugging)
    formData.forEach((value, key) => {
      console.log(key, value);
    });


    this.subscriptions.push(this.partyService.postParty(formData).subscribe({
      next: () => {
        this.actionConfirmed.emit();
        this.closeModal();
        const msg = this.translateService.instant('guests.create.form.notifications.success.message');
        const title = this.translateService.instant('guests.create.form.notifications.success.title');
        this.toastrService.success(msg, title);
      },
      error: (err) => {
        console.error('Error while creating guest:', err);
        this.toastrService.error(
          this.translateService.instant('guests.create.form.notifications.error.message'),
          this.translateService.instant('guests.create.form.notifications.error.title')
        );
      }
    }));
  }

  closeModal(): void {
    this.modalRef.hide();
    this.guestForm.reset();
    this.imageFile = null;
    this.birthDateModel = { startDate: null, endDate: null };
    this.expirationDateModel = { startDate: null, endDate: null };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.isNavigating = true;
  }

}
