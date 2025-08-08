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
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { Icon, icon, latLng, marker, tileLayer } from 'leaflet';

import { CountrySelectComponent } from '../../../../shared/components/country-select/country-select.component';
import { emailValidator } from '../../../../shared/validators/email.validator';
import { noNumbersValidator } from '../../../../shared/validators/no-number.validator';
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
    CountrySelectComponent,
    LeafletModule
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
  removeLogoFlag = false;

  // Enum options for template
  propertyTypes = Object.values(PropertyTypeEnum);
  unitTypes = Object.values(UnitTypeEnum);
  currencies = Object.values(CurrencyEnum);
  timezones: TimezoneOption[] = [];

  // Phone input configuration
  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;

  // Map configuration
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18})
    ],
    zoom: 4,
    center: latLng(33.835345855552134, -7.61279)
  };
  layers!: any;

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
      address: this.fb.group({
        street1: ['', [Validators.required]],
        street2: [''],
        postCode: [''],
        city: ['', [Validators.required, noNumbersValidator()]],
        country: ['MA', [Validators.required]],
        location: this.fb.group({
          lat: [null],
          lng: [null],
        })
      }),
      contact: this.fb.group({
        mobile: ['', [Validators.required]],
        email: ['', [emailValidator()]]
      }),
      timezone: ['Africa/Casablanca', [Validators.required]],
      currency: [CurrencyEnum.MAD, [Validators.required]]
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
      address: {
        street1: property.address?.street1 || '',
        street2: property.address?.street2 || '',
        postCode: property.address?.postCode || '',
        city: property.address?.city || '',
        country: property.address?.country || '',
        location: {
          lat: property.address?.location?.lat || null,
          lng: property.address?.location?.lng || null
        }
      },
      contact: {
        mobile: property.contact?.mobile || '',
        email: property.contact?.email || ''
      },
      timezone: property.timezone,
      currency: property.currency
    });

    // Recharger le logo si il existe
    if (property.logoId && !this.logoPreviewUrl) {
      this.loadLogo(property.logoId);
    }

    // Set up map if coordinates exist
    if (property.address?.location?.lat && property.address?.location?.lng) {
      this.layers = [
        marker([property.address.location.lat, property.address.location.lng], {
          icon: icon({
            ...Icon.Default.prototype.options,
            iconUrl: 'assets/marker-icon.png',
            iconRetinaUrl: 'assets/marker-icon-2x.png',
            shadowUrl: 'assets/marker-shadow.png'
          })
        })
      ];
    }
  }

  private loadLogo(logoId?: string): void {
    if (!logoId) {
      this.logoPreviewUrl = undefined;
      return;
    }
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
      this.removeLogoFlag = false;

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
    this.removeLogoFlag = true; // Set flag for backend

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

  setMarker(event: any): void {
    console.log('Marker event:', event);
    this.layers = [
      marker([event.latlng.lat, event.latlng.lng], {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png'
        })
      })
    ];

    this.propertyForm.patchValue({
      address: {
        location: {
          lat: event.latlng.lat,
          lng: event.latlng.lng
        }
      }
    });
  }

  submit(): void {
    if (!this.propertyForm.valid || this.isSubmitting) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.propertyForm.value;

    const payload = this.property ? this.createPatchPayload(formValue) : this.createPostPayload(formValue);

    const logoFileToSend = this.selectedLogoFile || (this.removeLogoFlag ? undefined : undefined);

    const request$ = this.property
      ? this.propertyApiService.updateProperty(this.property.id, payload as PropertyPatchModel, logoFileToSend)
      : this.propertyApiService.createProperty(payload as PropertyPostModel, logoFileToSend);

    this.subscriptions.push(
      request$.subscribe({
        next: (updatedProperty) => {
          this.isSubmitting = false;
          this.property = updatedProperty;
          this.selectedLogoFile = undefined;
          this.removeLogoFlag = false;
          if (this.logoPreviewUrl) {
            URL.revokeObjectURL(this.logoPreviewUrl);
            this.logoPreviewUrl = undefined;
          }
          setTimeout(() => {
            this.loadLogo(updatedProperty.logoId);
          }, 500);

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
        street1: formValue.address.street1?.trim(),
        street2: formValue.address.street2?.trim(),
        postCode: formValue.address.postCode?.trim(),
        city: formValue.address.city?.trim(),
        country: formValue.address.country,
        location: {
          lat: formValue.address.location?.lat,
          lng: formValue.address.location?.lng
        }
      },
      contact: {
        mobile: formValue.contact.mobile?.e164Number || formValue.contact.mobile,
        email: formValue.contact.email?.trim()
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
        street1: formValue.address.street1?.trim(),
        street2: formValue.address.street2?.trim(),
        postCode: formValue.address.postCode?.trim(),
        city: formValue.address.city?.trim(),
        country: formValue.address.country,
        location: {
          lat: formValue.address.location?.lat,
          lng: formValue.address.location?.lng
        }
      },
      contact: {
        mobile: formValue.contact.mobile?.e164Number || formValue.contact.mobile,
        email: formValue.contact.email?.trim()
      },
      timezone: formValue.timezone,
      currency: formValue.currency,
      removeLogo: this.removeLogoFlag
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

  // Méthode pour debug
  get formErrors(): any {
    return this.getFormValidationErrors(this.propertyForm);
  }

  private getFormValidationErrors(form: FormGroup): any {
    const result: any = {};
    Object.keys(form.controls).forEach(key => {
      const controlErrors = form.get(key)?.errors;
      if (controlErrors) {
        result[key] = controlErrors;
      }
      // Check nested form groups
      const control = form.get(key);
      if (control instanceof FormGroup) {
        const nestedErrors = this.getFormValidationErrors(control);
        if (Object.keys(nestedErrors).length > 0) {
          result[key] = { ...result[key], ...nestedErrors };
        }
      }
    });
    return result;
  }
}
