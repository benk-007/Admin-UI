import { Component, OnInit, OnDestroy } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators} from '@angular/forms';
import { Dayjs } from 'dayjs';
import {AvailabilityGetResource} from '../../models/availability/get/availability-get.model';
import {AvailabilityPostResource} from '../../models/availability/post/availability-post.model';
import {AvailabilityApiService} from '../../services/booking-api.service';
import {ButtonDirective, ColComponent, RowComponent} from '@coreui/angular';
import {NgIf} from '@angular/common';
import {NgxDaterangepickerBootstrapDirective} from 'ngx-daterangepicker-bootstrap';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ToastrService} from 'ngx-toastr';
import {IconDirective} from '@coreui/icons-angular';
import {cilSearch} from '@coreui/icons';

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
    IconDirective
  ],
  standalone: true
})
export class AvailabilityListComponent implements OnInit, OnDestroy {

  icons = {cilSearch}

  form!: FormGroup;
  dateRange: { startDate: Dayjs; endDate: Dayjs } | null = null;

  availableUnits: AvailabilityGetResource[] = [];
  isSearchPerformed = false;
  isNavigating = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly availabilityApi: AvailabilityApiService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      party: ['', Validators.required],
      segmentId: ['', Validators.required],
      subSegmentId: ['', Validators.required],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: this.fb.array([])
    });
  }

  onSearch(): void {
    if (!this.dateRange?.startDate || !this.dateRange?.endDate) {
      return;
    }

    if (this.form.invalid) {
      return;
    }

    const payload: AvailabilityPostResource = {
      party: this.form.value.party,
      checkinDate: this.dateRange.startDate.format('DD-MM-YYYY'),
      checkoutDate: this.dateRange.endDate.format('DD-MM-YYYY'),
      segmentId: this.form.value.segmentId,
      subSegmentId: this.form.value.subSegmentId,
      guests: {
        adults: this.form.value.adults,
        children: this.form.value.children
      }
    };

    this.availabilityApi.getAvailableUnits(payload).subscribe({
      next: (units) => {
        this.availableUnits = units;
        this.isSearchPerformed = true;
      },
      error: (err) => {
        this.toastrService.warning(
          this.translateService.instant('availability.list.notifications.error.message'),
          this.translateService.instant('availability.list.notifications.error.title'));
      }
    });
  }

  onBook(unit: AvailabilityGetResource): void {
    if (!this.dateRange?.startDate || !this.dateRange?.endDate) return;

    this.isNavigating = true;
    this.router.navigate(['../booking'], {
      queryParams: {
        unitId: unit.id,
        startDate: this.dateRange.startDate.toISOString(),
        endDate: this.dateRange.endDate.toISOString()
      },
      relativeTo: this.route
    });
  }

  ngOnDestroy(): void {
  }
}

