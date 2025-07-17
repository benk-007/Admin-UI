import {
  Component,
  EventEmitter, Inject,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
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
  FormLabelDirective,
  RowComponent
} from '@coreui/angular';
import {
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent
} from '@ng-select/ng-select';
import {RateApiService} from '../../../../../services/rate-api.service';


@Component({
  selector: 'app-unit-rate-plans-create-modal',
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
    NgSelectComponent,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
  ],
  templateUrl: './unit-rate-plans-create-modal.component.html',
  styleUrl: './unit-rate-plans-create-modal.component.scss'
})
export class UnitRatePlansCreateModalComponent implements OnInit, OnDestroy {

  @Output() actionConfirmed = new EventEmitter<void>();
  ratePlanForm: FormGroup;
  unitId!: string;


  segments = [
    {uuid: 'seg1', name: 'Segment 1'},
    {uuid: 'seg2', name: 'Segment 2'},
  ];
  subSegments = [
    {uuid: 'sub1', name: 'Subsegment A'},
    {uuid: 'sub2', name: 'Subsegment B'},
  ];

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly rateService: RateApiService,
    private readonly modalRef: BsModalRef,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService,
  ) {
    this.ratePlanForm = this.fb.group({
      name: [null, [Validators.required]],
      segment: [null],
      subSegment: [null],
      enabled: [false, [Validators.required]]
    });
  }

  ngOnInit(): void {
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
      segment: formValue.segment ? {
        uuid: formValue.segment.uuid,
        name: formValue.segment.name
      } : null,
      subSegment: formValue.subSegment ? {
        uuid: formValue.subSegment.uuid,
        name: formValue.subSegment.name
      } : null,
      enabled: formValue.enabled,
      unit: { uuid: this.unitId }
    };

    console.log("payload to be sent", payload);

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
          console.error('Error creating rate plan:', err);
          this.toastrService.error(
            this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.create.notifications.error.message'),
            this.translateService.instant('units.edit-unit.tabs.rates.ratesPlans.create.notifications.error.title')
          );
        }
      })
    );
  }

  closeModal(): void {
    this.modalRef.hide();
    this.ratePlanForm.reset();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
