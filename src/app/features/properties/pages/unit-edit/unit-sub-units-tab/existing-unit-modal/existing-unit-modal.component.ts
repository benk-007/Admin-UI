import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

// CoreUI Components
import {
  ColComponent, RowComponent, FormDirective,
  FormLabelDirective, FormFeedbackComponent
} from '@coreui/angular';

// Services and Components
import { UnitApiService } from '../../../../services/unit-api.service';
import { UnitSelectComponent } from '../../../../../../shared/components/unit-select/unit-select.component';

@Component({
  selector: 'app-existing-unit-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ColComponent,
    RowComponent,
    FormDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    UnitSelectComponent
  ],
  templateUrl: './existing-unit-modal.component.html',
  styleUrl: './existing-unit-modal.component.scss'
})
export class ExistingUnitModalComponent implements OnDestroy {

  // Form and state
  assignForm: FormGroup;
  isSubmitting: boolean = false;
  multiUnitId!: string;

  // Output events
  @Output() unitAssigned = new EventEmitter<any>();

  // Subscription management
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private modalRef: BsModalRef,
    private unitApiService: UnitApiService,
    private toastrService: ToastrService
  ) {
    this.assignForm = this.fb.group({
      selectedUnits: [null, [Validators.required]]
    });
  }

  /**
   * Submit form and assign existing units
   */
  onSubmit(): void {
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const selectedUnits = this.assignForm.value.selectedUnits;

    const payload = {
      unitIds: selectedUnits.map((unit: any) => unit.id)
    };

    this.subscriptions.push(
      this.unitApiService.assignExistingUnits(this.multiUnitId, payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.unitAssigned.emit(response);
          this.closeModal();
          this.toastrService.success(
            `${selectedUnits.length} unit(s) assigned successfully`,
            'Units Assigned'
          );
        },
        error: (err) => {
          console.error('Error assigning units:', err);
          this.isSubmitting = false;
          this.toastrService.error(
            'Failed to assign units. Please try again.',
            'Assignment Failed'
          );
        }
      })
    );
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.modalRef.hide();
  }

  /**
   * Cleanup subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
