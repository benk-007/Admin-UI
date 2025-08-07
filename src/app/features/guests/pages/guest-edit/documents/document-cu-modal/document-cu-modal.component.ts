import { Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {ToastrService} from 'ngx-toastr';
import {Subscription} from 'rxjs';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

import {IdentityDocumentService} from '../../../../services/identity-document.service';
import {IdentityDocumentItemGetModel} from '../../../../models/get/identity-document-item-get.model';
import {DocumentTypeEnum} from '../../../../models/enums/document-type.enum';
import moment from 'moment';
import {
  ButtonDirective,
  ColComponent, DropdownComponent, DropdownItemDirective,
  DropdownMenuDirective, DropdownToggleDirective, FormControlDirective,
  FormFeedbackComponent, FormLabelDirective,
  InputGroupComponent,
  RowComponent
} from '@coreui/angular';
import {NgForOf, NgIf} from '@angular/common';
import {NgxDaterangepickerBootstrapDirective} from 'ngx-daterangepicker-bootstrap';
import {IdentityDocumentPatchModel} from '../../../../models/patch/identity-document-patch.model';
import {IdentityDocumentPostModel} from '../../../../models/post/identity-document-post.model';

@Component({
  selector: 'app-document-cu-modal',
  templateUrl: './document-cu-modal.component.html',
  imports: [
    FormFeedbackComponent,
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    InputGroupComponent,
    DropdownMenuDirective,
    DropdownItemDirective,
    NgForOf,
    FormControlDirective,
    TranslatePipe,
    NgIf,
    NgxDaterangepickerBootstrapDirective,
    FormsModule,
    FormLabelDirective,
    ButtonDirective,
    DropdownComponent,
    DropdownToggleDirective
  ],
  styleUrls: ['./document-cu-modal.component.scss']
})
export class DocumentCuModalComponent implements OnInit, OnDestroy {

  @Input() documentToEdit?: IdentityDocumentItemGetModel;
  @Input() guestId!: string;
  @Output() actionConfirmed = new EventEmitter<void>();

  documentForm: FormGroup = this.fb.group({
    type: [DocumentTypeEnum.IDENTITY_CARD, Validators.required],
    value: ['', Validators.required],
    expirationDate: [null, Validators.required],
    file: [null, Validators.required]
  });
  documentTypes: DocumentTypeEnum[] = Object.values(DocumentTypeEnum);
  expirationDateModel: { startDate: moment.Moment | null, endDate: moment.Moment | null } = { startDate: null, endDate: null };

  file: File | null = null;
  isNewFile: boolean = false;
  imageUrl: SafeUrl | null = null;
  isNavigating = false;

  private subscriptions: Subscription[] = [];

  datePickerLocale = {
    format: 'DD-MM-YYYY',
    applyLabel: this.translate.instant('commons.apply'),
    cancelLabel: this.translate.instant('commons.cancel')
  };

  constructor(
    private fb: FormBuilder,
    private identityDocumentService: IdentityDocumentService,
    private modalRef: BsModalRef,
    private translate: TranslateService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.documentToEdit) {
      this.documentForm.patchValue({
        type: this.documentToEdit.type,
        value: this.documentToEdit.value
      });
      if (this.documentToEdit.expirationDate) {
        setTimeout(() => {
          const parsed = moment(this.documentToEdit?.expirationDate, 'YYYY-MM-DD');
          this.expirationDateModel = { startDate: parsed, endDate: parsed };

          const expirationControl = this.documentForm.get('expirationDate');
          expirationControl?.setValue(parsed.format('YYYY-MM-DD'));
          expirationControl?.markAsTouched();
          expirationControl?.updateValueAndValidity();

          this.documentForm.updateValueAndValidity();

          console.log('Expiration date set to:', expirationControl?.value);
        }, 0);
      }
      if (this.documentToEdit.fileProvided && this.documentToEdit.mediaId) {
        this.fetchImage(this.documentToEdit.mediaId);
      }
    }
  }

  setDocumentType(type: DocumentTypeEnum): void {
    this.documentForm.patchValue({ type });
  }

  onExpirationDateChange(event: any): void {
    if (event?.startDate) {
      const formatted = event.startDate.format('YYYY-MM-DD');
      this.expirationDateModel = event;
      this.documentForm.patchValue({
        expirationDate: formatted
      });
      this.documentForm.get('expirationDate')?.markAsDirty();
      this.documentForm.get('expirationDate')?.markAsTouched();
      this.documentForm.updateValueAndValidity();
    } else {
      this.expirationDateModel = { startDate: null, endDate: null };
      this.documentForm.get('expirationDate')?.setValue(null);
    }
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      const objectUrl = URL.createObjectURL(this.file);
      this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      this.isNewFile = true;

      this.documentForm.get('file')?.setValue(this.file);
      this.documentForm.get('file')?.markAsTouched();
    }
  }

  removeImage(): void {
    this.imageUrl = null;
    this.file = null;
    this.isNewFile = false;
    this.documentForm.get('file')?.reset();
  }

  fetchImage(mediaId: string): void {
    const sub = this.identityDocumentService.getIdentityDocumentImageById(mediaId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);

        this.documentForm.get('file')?.setValue('existing');
        this.documentForm.get('file')?.markAsTouched();
        this.documentForm.get('file')?.updateValueAndValidity();
      },
      error: () => {
        this.toastr.warning(this.translate.instant('documents.errors.image-load'));
      }
    });
    this.subscriptions.push(sub);
  }

  submit(): void {
    if (this.documentForm.invalid) return;

    const formValues = this.documentForm.value;
    const expirationDate = this.expirationDateModel.startDate?.format('YYYY-MM-DD') ?? null;

    let payload: IdentityDocumentPostModel | IdentityDocumentPatchModel;

    if (this.documentToEdit) {
      payload = {
        type: formValues.type,
        value: formValues.value,
        expirationDate: expirationDate ?? undefined
      };
    } else {
      payload = {
        type: formValues.type,
        value: formValues.value,
        expirationDate: expirationDate ?? undefined,
        partyId: this.guestId
      };
    }


    const formData = new FormData();
    formData.append('payload', new Blob(
      [JSON.stringify(payload)],
      { type: 'application/json' }
    ));

    if (this.file && this.isNewFile) {
      formData.append('file', this.file);
    }

    const request$ = this.documentToEdit
      ? this.identityDocumentService.updateDocument(this.documentToEdit.id, formData)
      : this.identityDocumentService.createDocument(formData);

    const sub = request$.subscribe({
      next: () => {
        const isEdit = !!this.documentToEdit;
        this.toastr.success(
          this.translate.instant(`documents.cu-modal.notifications.success.message.${isEdit ? 'edit' : 'create'}`),
          this.translate.instant(`documents.cu-modal.notifications.success.title.${isEdit ? 'edit' : 'create'}`)
        );
        this.actionConfirmed.emit();
        this.closeModal();
      },
      error: () => {
        const isEdit = !!this.documentToEdit;
        this.toastr.error(
          this.translate.instant(`documents.cu-modal.notifications.error.message.${isEdit ? 'edit' : 'create'}`),
          this.translate.instant(`documents.cu-modal.notifications.error.title.${isEdit ? 'edit' : 'create'}`)
        );
      }
    });

    this.subscriptions.push(sub);
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.isNavigating = true;
  }
}
