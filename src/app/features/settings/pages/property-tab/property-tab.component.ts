import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  RowComponent
} from '@coreui/angular';
import { NgxIntlTelInputModule, CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
import { NgSelectComponent, NgLabelTemplateDirective, NgOptionTemplateDirective } from '@ng-select/ng-select';


import { CountrySelectComponent } from '../../../../shared/components/country-select/country-select.component';
import { emailValidator } from '../../../../shared/validators/email.validator';
import { TimezoneService, TimezoneOption } from '../../../../shared/services/timezone.service';
import {UnitTypeEnum} from '../../../properties/models/unit/enums/unit-type.enum';
import {PropertyTypeEnum} from '../../models/property/enum/property-type.enum';
import {PropertyApiService} from '../../services/property-api.service';
import {PropertyGetModel} from '../../models/property/get/property-get.model';
import {PropertyPatchModel} from '../../models/property/patch/property-patch.model';
import {CurrencyEnum} from '../../models/property/enum/currency.enum';
import {PropertyPostModel} from '../../models/property/post/property-post.model';

@Component({
  selector: 'app-property-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ButtonDirective,
    ColComponent,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    FormSelectDirective,
    RowComponent,
    NgxIntlTelInputModule,
    NgSelectComponent,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    CountrySelectComponent
  ],
  templateUrl: './property-tab.component.html',
  styleUrls: ['./property-tab.component.scss']
})
export class PropertyTabComponent implements OnInit, OnDestroy {

  propertyForm: FormGroup;
  property?: PropertyGetModel;
  isSubmitting = false;
  logoPreviewUrl?: string;
  selectedLogoFile?: File;

  // Enum options for template
  propertyTypes = Object.values(PropertyTypeEnum);
  unitTypes = Object.values(UnitTypeEnum);
  currencies = Object.values(CurrencyEnum);
  timezones: TimezoneOption[] = [];

  // Phone input configuration
  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly propertyApiService: PropertyApiService,
    private readonly timezoneService: TimezoneService,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
    this.propertyForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadTimezones();
    this.loadProperty();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    // Clean up object URLs to prevent memory leaks
    if (this.logoPreviewUrl) {
      URL.revokeObjectURL(this.logoPreviewUrl);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      type: [PropertyTypeEnum.HOTEL, [Validators.required]],
      defaultUnitType: [UnitTypeEnum.ROOM],
      street1: ['', [Validators.required]],
      street2: [''],
      postCode: [''],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
      mobile: [''],
      email: ['', [emailValidator()]],
      timezone: ['Africa/Casablanca'],
      currency: [CurrencyEnum.MAD]
    });
  }

  private loadTimezones(): void {
    // Load common timezones first for better UX
    this.timezones = this.timezoneService.getCommonTimezones();
  }

  private loadProperty(): void {
    this.subscriptions.push(
      this.propertyApiService.getCurrentProperty().subscribe({
        next: (property) => {
          this.property = property;
          this.populateForm(property);
          this.loadLogo(property.logoId);
        },
        error: (error) => {
          if (error.status === 404) {
            console.log('No property found - starting with empty form');
          } else {
            console.error('Error loading property:', error);
            this.toastrService.error(
              'Failed to load property data',
              'Loading Error'
            );
          }
        }
      })
    );
  }

  private populateForm(property: PropertyGetModel): void {
    this.propertyForm.patchValue({
      name: property.name,
      type: property.type,
      defaultUnitType: property.defaultUnitType,
      street1: property.address?.street1 || '',
      street2: property.address?.street2 || '',
      postCode: property.address?.postCode || '',
      city: property.address?.city || '',
      country: property.address?.country || '',
      mobile: property.contact?.mobile || '',
      email: property.contact?.email || '',
      timezone: property.timezone,
      currency: property.currency
    });
  }

  private loadLogo(logoId?: string): void {
    if (!logoId) return;

    this.subscriptions.push(
      this.propertyApiService.getMediaById(logoId).subscribe({
        next: (blob) => {
          this.logoPreviewUrl = URL.createObjectURL(blob);
        },
        error: (error) => {
          console.error('Error loading logo:', error);
        }
      })
    );
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // Validate file type
      if (!this.isValidImageFile(file)) {
        this.toastrService.error(
          'Only PNG and SVG files are allowed',
          'Invalid File Type'
        );
        input.value = '';
        return;
      }

      this.selectedLogoFile = file;

      // Create preview URL
      if (this.logoPreviewUrl) {
        URL.revokeObjectURL(this.logoPreviewUrl);
      }
      this.logoPreviewUrl = URL.createObjectURL(file);
    }
  }

  private isValidImageFile(file: File): boolean {
    const allowedTypes = ['image/png', 'image/svg+xml'];
    return allowedTypes.includes(file.type);
  }

  removeLogo(): void {
    this.selectedLogoFile = undefined;
    if (this.logoPreviewUrl) {
      URL.revokeObjectURL(this.logoPreviewUrl);
      this.logoPreviewUrl = undefined;
    }

    // Reset file input
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  submit(): void {
    if (!this.propertyForm.valid || this.isSubmitting) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.propertyForm.value;

    const payload = this.property ? this.createPatchPayload(formValue) : this.createPostPayload(formValue);

    const request$ = this.property
      ? this.propertyApiService.updateProperty(this.property.id, payload as PropertyPatchModel, this.selectedLogoFile)
      : this.propertyApiService.createProperty(payload as PropertyPostModel, this.selectedLogoFile);

    this.subscriptions.push(
      request$.subscribe({
        next: (updatedProperty) => {
          this.isSubmitting = false;
          this.property = updatedProperty;
          this.selectedLogoFile = undefined;
          this.loadLogo(updatedProperty.logoId);

          const message = this.property
            ? 'Property updated successfully'
            : 'Property created successfully';

          this.toastrService.success(message, 'Success');
        },
        error: (error) => {
          console.error('Error saving property:', error);
          this.isSubmitting = false;

          const message = this.property
            ? 'Failed to update property'
            : 'Failed to create property';

          this.toastrService.error(message, 'Error');
        }
      })
    );
  }

  private createPostPayload(formValue: any): PropertyPostModel {
    return {
      name: formValue.name.trim(),
      type: formValue.type,
      defaultUnitType: formValue.defaultUnitType,
      address: {
        street1: formValue.street1?.trim(),
        street2: formValue.street2?.trim(),
        postCode: formValue.postCode?.trim(),
        city: formValue.city?.trim(),
        country: formValue.country
      },
      contact: {
        mobile: formValue.mobile?.e164Number || formValue.mobile,
        email: formValue.email?.trim()
      },
      timezone: formValue.timezone,
      currency: formValue.currency
    };
  }

  private createPatchPayload(formValue: any): PropertyPatchModel {
    return {
      name: formValue.name.trim(),
      type: formValue.type,
      defaultUnitType: formValue.defaultUnitType,
      address: {
        street1: formValue.street1?.trim(),
        street2: formValue.street2?.trim(),
        postCode: formValue.postCode?.trim(),
        city: formValue.city?.trim(),
        country: formValue.country
      },
      contact: {
        mobile: formValue.mobile?.e164Number || formValue.mobile,
        email: formValue.email?.trim()
      },
      timezone: formValue.timezone,
      currency: formValue.currency
    };
  }

  getPropertyTypeLabel(type: PropertyTypeEnum): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  getUnitTypeLabel(type: UnitTypeEnum): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  getCurrencyLabel(currency: CurrencyEnum): string {
    const currencyLabels: { [key in CurrencyEnum]: string } = {
      [CurrencyEnum.MAD]: 'MAD - Moroccan Dirham',
      [CurrencyEnum.EUR]: 'EUR - Euro',
      [CurrencyEnum.USD]: 'USD - US Dollar'
    };
    return currencyLabels[currency] || currency;
  }
}
