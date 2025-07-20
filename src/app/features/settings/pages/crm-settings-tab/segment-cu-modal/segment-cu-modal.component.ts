import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CrmApiService} from '../../../../crm/services/crm-api.service';
import {ToastrService} from 'ngx-toastr';
import {
  ButtonDirective,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent
} from '@coreui/angular';
import {SegmentItemGetModel} from '../../../models/segment/segment-item-get.model';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {JsonPipe} from '@angular/common';
import {SegmentPostModel} from '../../../models/segment/segment-post.model';
import {Subscription} from 'rxjs';
import {SegmentSelectComponent} from '../../../../../shared/components/segment-select/segment-select.component';

@Component({
  selector: 'app-segment-cu-modal',
  imports: [
    TranslatePipe,
    FormDirective,
    FormsModule,
    ReactiveFormsModule,
    ButtonDirective,
    ColComponent,
    RowComponent,
    JsonPipe,
    FormControlDirective,
    FormFeedbackComponent,
    FormLabelDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    SegmentSelectComponent
  ],
  templateUrl: './segment-cu-modal.component.html',
  styleUrl: './segment-cu-modal.component.scss'
})
export class SegmentCuModalComponent implements OnInit, OnDestroy {
  private component = '[SegmentCuModalComponent]: ';

  segmentToEdit!: SegmentItemGetModel;
  segmentForm: FormGroup;
  @Output() actionConfirmed = new EventEmitter<string>();
  private readonly subscriptions: Subscription[] = [];

  public constructor(private readonly fb: FormBuilder,
                     private readonly crmApiService: CrmApiService,
                     private readonly modalRef: BsModalRef,
                     private readonly translateService: TranslateService,
                     private readonly toastrService: ToastrService) {
    this.segmentForm = this.fb.group({
      name: [null, [Validators.required]],
      enabled: [false, [Validators.required]],
      parent: [null],
      description: [null]
    });
  }


  ngOnInit(): void {
    if (this.segmentToEdit) {
      this.segmentForm.patchValue({
        name: this.segmentToEdit.name,
        description: this.segmentToEdit.description,
        parent: this.segmentToEdit.parent,
        enabled: this.segmentToEdit.enabled
      })
    }
  }


  submit() {
    let payload: SegmentPostModel = {
      name: this.segmentForm.value.name,
      description: this.segmentForm.value.description,
      parentId: this.segmentForm.value.parent?.id,
      enabled: this.segmentForm.value.enabled
    }
    if (this.segmentToEdit) {
      this.subscriptions.push(this.crmApiService.patchSegmentById(this.segmentToEdit.id, payload).subscribe({
        next: (data) => {
          console.info(this.component.concat('Segment updated successfully. API response is:'), data);
          //TODO: add toastr
          this.actionConfirmed.emit();
          this.closeModal();
        },
        error: (err) => {
          console.error(this.component.concat('An error occurred when updating segment with payload:'), payload, 'Error API is:', err);
        }
      }))
    } else {
      this.subscriptions.push(this.crmApiService.postSegment(payload).subscribe({
        next: (data) => {
          console.info(this.component.concat('Segment created successfully. API response is:'), data);
          //TODO: add toastr
          this.actionConfirmed.emit();
          this.closeModal()
        },
        error: (err) => {
          //TODO: add toastr
          console.error(this.component.concat('An error occurred when creating segment with payload:'), payload, 'Error API is:', err);
        }
      }))
    }
  }

  closeModal() {
    this.modalRef.hide();
    this.segmentForm.reset();
  }

  ngOnDestroy(): void {
    console.debug(this.component.concat("Unsubscribing all subscriptions ..."))
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
