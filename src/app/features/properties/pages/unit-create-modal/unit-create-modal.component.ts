import {Component, EventEmitter, OnDestroy, Output} from '@angular/core';
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent
} from "@coreui/angular";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {BsModalRef} from "ngx-bootstrap/modal";
import {ToastrService} from "ngx-toastr";
import {Subscription} from "rxjs";
import {CountryISO, NgxIntlTelInputModule, SearchCountryField} from "ngx-intl-tel-input";
import {emailValidator} from "../../../../shared/validators/email.validator";
import {CountrySelectComponent} from "../../../../shared/components/country-select/country-select.component";
import {noNumbersValidator} from "../../../../shared/validators/no-number.validator";
// import {UnitPostModel} from "../../models/unit-post.model";
import {UnitApiService} from "../../services/unit-api.service";

@Component({
  selector: 'app-unit-create-modal',
  imports: [
    TranslatePipe,
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
    CountrySelectComponent
  ],
  templateUrl: './unit-create-modal.component.html',
  styleUrl: './unit-create-modal.component.scss'
})
export class UnitCreateModalComponent implements OnDestroy {

  // unitForm: FormGroup;
  @Output() actionConfirmed = new EventEmitter<string>();

  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;
  private readonly subscriptions: Subscription[] = [];

  public constructor(private readonly fb: FormBuilder, private readonly unitApiService: UnitApiService,
                     private readonly modalRef: BsModalRef, private readonly translateService: TranslateService,
                     private readonly toastrService: ToastrService) {
    // this.unitForm = this.fb.group({
    //   name: [null, [Validators.required]],
    //   subtitle: [null],
    //   street1: [null, [Validators.required]],
    //   street2: [null],
    //   postcode: [null],
    //   city: [null, [Validators.required, noNumbersValidator()]],
    //   country: [null, [Validators.required]],
    //   mobile: [null, [Validators.required]],
    //   email: [null, [emailValidator()]]
    // })
  }
/*
  submit() {
    let payload: UnitPostModel = {
      name: this.unitForm.value.name,
      subtitle: this.unitForm.value.subtitle,
      address: {
        street1: this.unitForm.value.street1,
        street2: this.unitForm.value.street2,
        postCode: this.unitForm.value.postcode,
        city: this.unitForm.value.city,
        country: this.unitForm.value.country
      },
      contact: {
        mobile: this.unitForm.value.mobile.e164Number,
        email: this.unitForm.value.email
      }
    }
    console.log('your payload is:', payload);

    this.subscriptions.push(this.unitApiService.postUnit(payload).subscribe({
      next: (data) => {
        console.log('Your post unit API response is:', data);
        this.actionConfirmed.emit("");
        this.closeModal();
        let message = this.translateService.instant('units.create-unit.form.notifications.success.message');
        this.toastrService.success(message.replace(':unit', data.name),
          this.translateService.instant('units.create-unit.form.notifications.success.title')
        )
      },
      error: (err) => {
        console.log('An error occurred when calling post unit API: ', err);
        this.toastrService.error(this.translateService.instant('units.create-unit.form.notifications.error.message'),
          this.translateService.instant('units.create-unit.form.notifications.success.title')
        )
      }
    }))

  }

  closeModal() {
    this.modalRef.hide();
    this.unitForm.reset();
  }*/

  ngOnDestroy(): void {
    console.log('unsubscribe')
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

}
