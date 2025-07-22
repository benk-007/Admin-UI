import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {ToastrService} from 'ngx-toastr';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent
} from '@coreui/angular';
import {RateApiService} from '../../../../../services/rate-api.service';
import {RatePlanGetModel} from '../../../../../models/rate/get/rate-plan-get.model';
import {SegmentSelectComponent} from '../../../../../../../shared/components/segment-select/segment-select.component';

@Component({
  selector: 'app-unit-rate-plans-cu-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    ButtonDirective,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    TranslatePipe,
    CommonModule,
    FormFeedbackComponent,
    SegmentSelectComponent
  ],
  templateUrl: './unit-rate-plans-cu-modal.component.html',
  styleUrl: './unit-rate-plans-cu-modal.component.scss'
})
export class UnitRatePlansCuModalComponent implements OnInit, OnDestroy {
  @Input() unitId!: string;
  @Input() ratePlanToEdit?: RatePlanGetModel;
  @Output() actionConfirmed = new EventEmitter<void>();

  ratePlanForm: FormGroup;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly rateService: RateApiService,
    private readonly modalRef: BsModalRef,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
    this.ratePlanForm = this.fb.group({
      name: [null, [Validators.required]],
      segments: [[]],
      enabled: [false, [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.ratePlanToEdit) {
      this.ratePlanForm.patchValue({
        name: this.ratePlanToEdit.name,
        segments: this.ratePlanToEdit.segments ?? [],
        enabled: this.ratePlanToEdit.enabled
      });
    }
  }

  submit(): void {
    if (this.ratePlanForm.invalid) {
      this.toastrService.error(
        this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.create.notifications.error.message'),
        this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.create.notifications.error.title')
      );
      return;
    }

    const formValue = this.ratePlanForm.value;
    const payload = {
      name: formValue.name,
      segments: Array.isArray(formValue.segments)
        ? formValue.segments.map((s: any) => ({
          uuid: s.uuid ?? s.id,
          name: s.name
        }))
        : [],

      enabled: formValue.enabled,
      unit: {id: this.unitId}
    };

    if (this.ratePlanToEdit) {
      // Update
      this.subscriptions.push(
        this.rateService.updateRatePlan(this.ratePlanToEdit.id, payload).subscribe({
          next: () => {
            this.actionConfirmed.emit();
            this.closeModal();
            this.toastrService.success(
              this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.edit.notifications.success.message'),
              this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.edit.notifications.success.title')
            );
          },
          error: (err) => {
            const detail = err?.error?.detail;

            if (err.status === 409 && detail) {
              this.toastrService.error(detail, this.translateService.instant('commons.errors.conflict'));
            } else {
              this.toastrService.error(
                this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.create.notifications.error.message'),
                this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.create.notifications.error.title')
              );
            }
          }
        })
      );
    } else {
      // Create
      this.subscriptions.push(
        this.rateService.createRatePlan(payload).subscribe({
          next: () => {
            this.actionConfirmed.emit();
            this.closeModal();
            this.toastrService.success(
              this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.create.notifications.success.message'),
              this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.create.notifications.success.title')
            );
          },
          error: (err) => {
            const detail = err?.error?.detail;

            if (err.status === 409 && detail) {
              this.toastrService.error(detail, this.translateService.instant('commons.errors.conflict'));
            } else {
              this.toastrService.error(
                this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.create.notifications.error.message'),
                this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.create.notifications.error.title')
              );
            }
          }
        })
      );
    }
  }


  closeModal(): void {
    this.modalRef.hide();
    this.ratePlanForm.reset();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
