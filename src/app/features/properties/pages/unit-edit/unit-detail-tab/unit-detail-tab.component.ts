import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, skip, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

// CoreUI Components
import {
  ButtonDirective,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  GutterDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from "@coreui/angular";
import { IconDirective } from "@coreui/icons-angular";
import { cilSearch, cilTrash, cilX } from "@coreui/icons";

// Models and Services
import { UnitTypeEnum } from '../../../models/unit/enums/unit-type.enum';

import { UnitApiService } from '../../../services/unit-api.service';
import { UnitMapperService } from '../../../services/unit-mapper.service';
import {UnitDetailsGetModel} from '../../../models/details/get/unit-details-get.model';
import {FloorSizeUnitEnum} from '../../../models/details/enums/floor-size-unit.enum';
import { AmenityEnum } from '../../../models/details/enums/amenity.enum';

@Component({
  selector: 'app-unit-detail-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    // CoreUI Components
    RowComponent,
    ColComponent,
    FormSelectDirective,
    FormControlDirective,
    FormLabelDirective,
    InputGroupComponent,
    DropdownComponent,
    ButtonDirective,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    GutterDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    IconDirective,
    FormFeedbackComponent,
    InputGroupTextDirective
  ],
  templateUrl: './unit-detail-tab.component.html',
  styleUrl: './unit-detail-tab.component.scss'
})
export class UnitDetailTabComponent implements OnInit, OnDestroy {

  // Icons configuration
  icons = { cilTrash, cilX, cilSearch };

  // Form and data properties
  unitDetailsForm!: FormGroup;
  unit!: UnitDetailsGetModel;
  unitId!: string;

  // Enums for template usage
  unitTypes = Object.values(UnitTypeEnum);
  floorSizeUnits = Object.values(FloorSizeUnitEnum);

  // Amenities management
  sortedAmenities: { key: string, label: string }[] = [];
  filteredAmenities: { key: string, label: string }[] = [];
  basicSearch: string = '';

  // Search functionality
  private readonly $basicSearchSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  // Subscription management
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly unitMapperService: UnitMapperService,
    private readonly unitApiService: UnitApiService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeAmenities();
    this.extractUnitIdFromRoute();
    this.subscribeToBasicSearch();
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions to prevent memory leaks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Initialize amenities list with translations and sorting
   * Creates sorted list of amenities for form display
   */
  private initializeAmenities(): void {
    this.subscriptions.push(
      this.translateService.get('commons.amenities').subscribe((amenities: { [key: string]: string }) => {
        this.sortedAmenities = Object.keys(AmenityEnum).map((key) => ({
          key: AmenityEnum[key as keyof typeof AmenityEnum],
          label: amenities[key] ?? key
        })).sort((a, b) => a.label.localeCompare(b.label));

        this.filteredAmenities = this.sortedAmenities;
        this.createForm();
      })
    );
  }

  /**
   * Extract unit ID from route parameters
   * Handles nested route structure to find unitId parameter
   */
  private extractUnitIdFromRoute(): void {
    this.subscriptions.push(
      combineLatest(
        this.activatedRoute.pathFromRoot.map(route => route.paramMap)
      ).subscribe(paramMaps => {
        const unitId = paramMaps
          .map(paramMap => paramMap.get('unitId'))
          .find(id => id !== null);

        if (unitId) {
          this.unitId = unitId;
          this.retrieveUnitDetails();
        }
      })
    );
  }

  /**
   * Create reactive form with validation rules
   * Includes nested form groups for occupancy data
   */
  private createForm(): void {
    this.unitDetailsForm = this.fb.group({
      type: [null, [Validators.required]],
      floorSize: [null],
      floorSizeUnit: [FloorSizeUnitEnum.SQM],
      minOccupancy: this.fb.group({
        adults: [1, [Validators.required, Validators.min(1)]],
        children: [0, [Validators.required, Validators.min(0)]],
        infants: [0, [Validators.required, Validators.min(0)]]
      }),
      maxOccupancy: this.fb.group({
        adults: [2, [Validators.required, Validators.min(1)]],
        children: [0, [Validators.required, Validators.min(0)]],
        infants: [0, [Validators.required, Validators.min(0)]]
      }),
      childrenAllowed: [null],
      eventsAllowed: [null],
      smokingAllowed: [null],
      petsAllowed: [null],
      travellerAge: [null],
      description: [null],
      amenities: this.fb.group(
        Object.fromEntries(
          this.sortedAmenities.map(amenity => [amenity.key, new FormControl(false)])
        )
      )
    });
  }

  /**
   * Retrieve unit details from API and populate form
   * Handles form disabling for multi-units and sub-units
   */
  private retrieveUnitDetails(): void {
    this.subscriptions.push(
      this.unitApiService.getUnitDetailsById(this.unitId).subscribe({
        next: (data) => {
          console.log('Unit details retrieved successfully:', data);
          this.handleUnitDetailsSuccessResponse(data);
        },
        error: (err) => {
          console.error('Error retrieving unit details:', err);
          this.toastrService.error(
            'Failed to load unit details. Please try again.',
            'Loading Error'
          );
        }
      })
    );
  }

  /**
   * Process successful API response and update form
   * Separates amenities from other data for proper form population
   */
  private handleUnitDetailsSuccessResponse(data: UnitDetailsGetModel): void {
    this.unit = data;

    // Separate amenities from other unit details
    const { amenities, ...unitDetailsWithoutAmenities } = data;

    // Populate form with unit details (excluding amenities)
    this.unitDetailsForm.patchValue(unitDetailsWithoutAmenities);

    // Handle amenities checkboxes separately
    const amenitiesGroup = this.unitDetailsForm.get('amenities') as FormGroup;
    if (amenitiesGroup && this.unit.amenities) {
      this.unit.amenities.forEach(amenity => {
        const control = amenitiesGroup.get(amenity);
        if (control) {
          control.setValue(true);
        }
      });
    }
  }

  /**
   * Subscribe to search input changes with debouncing
   * Filters amenities list based on search term
   */
  private subscribeToBasicSearch(): void {
    this.subscriptions.push(
      this.$basicSearchSubject.pipe(
        skip(1),
        debounceTime(300),
        distinctUntilChanged(),
        filter(value => value !== null),
        tap(value => {
          if (value) {
            this.basicSearch = value;
          }
        }),
        map(searchTerm => {
          const term = searchTerm?.toLowerCase() || '';
          return this.sortedAmenities.filter(
            (amenity) => amenity.label.toLowerCase().includes(term)
          );
        })
      ).subscribe(filtered => {
        this.filteredAmenities = filtered;
      })
    );
  }

  /**
   * Handle amenity checkbox changes
   * Updates form control value when checkbox is toggled
   */
  setAmenity(event: Event, amenityKey: string): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    const amenityControl = this.unitDetailsForm.get('amenities')?.get(amenityKey);
    if (amenityControl) {
      amenityControl.setValue(isChecked);
    }
  }

  /**
   * Handle floor size unit dropdown selection
   * Updates form control when dropdown item is selected
   */
  setFloorSizeUnit(floorSizeUnit: string): void {
    this.unitDetailsForm.patchValue({
      floorSizeUnit: floorSizeUnit
    });
  }

  /**
   * Handle search input changes
   * Triggers search subject with debounced value
   */
  triggerBasicSearch(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value?.trim() || '';
    console.log('Triggering amenities search with value:', value);
    this.$basicSearchSubject.next(value);
  }

  /**
   * Submit form data to API
   * Validates form, maps data, and sends update request
   */
  submit(): void {
    if (!this.unitDetailsForm.valid) {
      this.unitDetailsForm.markAllAsTouched();
      return;
    }

    // Map form data to API payload format
    const payload = this.unitMapperService.formToDetailsPatchModel(
      this.unitDetailsForm.value,
      this.unitDetailsForm.get('amenities')!.value
    );

    this.subscriptions.push(
      this.unitApiService.updateUnitDetailsById(this.unitId, payload).subscribe({
        next: (data) => {
          console.log('Unit details updated successfully:', data);
          this.handleUnitDetailsSuccessResponse(data);
          this.toastrService.info(
            this.translateService.instant('units.edit-unit.tabs.detail-information.notifications.success.message')
              .replace(':rentalName', this.unit.name),
            this.translateService.instant('units.edit-unit.tabs.detail-information.notifications.success.title')
          );
        },
        error: (err) => {
          console.error('Error updating unit details:', err);
          this.toastrService.error(
            this.translateService.instant('units.edit-unit.tabs.detail-information.notifications.error.message')
              .replace(':rentalName', this.unit.name),
            this.translateService.instant('units.edit-unit.tabs.detail-information.notifications.error.title')
          );
        }
      })
    );
  }

  /**
   * Check if current unit is a sub-unit
   * Used for conditional rendering in template
   */
  get isSubUnit(): boolean {
    return this.unit?.parent != null;
  }
}
