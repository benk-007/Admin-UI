import {Component} from '@angular/core';
import {
  AvatarComponent,
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {
  cilClock,
  cilPen,
  cilSearch,
  cilSortAscending,
  cilSortDescending,
  cilSwapVertical,
  cilTrash
} from '@coreui/icons';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BsModalService} from 'ngx-bootstrap/modal';
import {ToastrService} from 'ngx-toastr';
import {EmptyDataComponent} from '../../../../../../shared/components/empty-data/empty-data.component';
import {ListContentComponent} from '../../../../../../shared/components/list-content/list-content.component';

import {DatePipe, NgClass} from '@angular/common';
import {IdentityDocumentService} from "../../../../services/identity-document.service";
import {TableControlComponent} from "../../../../../../shared/components/table-control/table-control.component";
import {AuditNamePipe} from "../../../../../../shared/pipes/audit-name.pipe";
import {BadgeComponent} from "../../../../../../shared/components/badge/badge.component";
import {DocumentCuModalComponent} from "../document-cu-modal/document-cu-modal.component";
import {ConfirmModalComponent} from "../../../../../../shared/components/confirm-modal/confirm-modal.component";
import {IdentityDocumentItemGetModel} from '../../../../models/get/identity-document-item-get.model';


@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    ButtonDirective,
    RowComponent,
    TranslatePipe,
    IconDirective,
    SpinnerComponent,
    TableDirective,
    EmptyDataComponent,
    DatePipe,
    InputGroupComponent,
    ColComponent,
    TableControlComponent,
    InputGroupTextDirective,
    FormControlDirective,
    AuditNamePipe,
    BadgeComponent,
    AvatarComponent,
    NgClass
  ],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
  providers: [BsModalService]
})
export class DocumentsComponent extends ListContentComponent {
  icons = {
    cilSearch,
    cilClock,
    cilPen,
    cilSwapVertical,
    cilSortAscending,
    cilSortDescending,
    cilTrash
  };
  guestId!: string;
  override listContent: IdentityDocumentItemGetModel[] = [];

  constructor(public override router: Router,
              public override route: ActivatedRoute,
              public readonly identityDocumentService: IdentityDocumentService,
              private readonly toastr: ToastrService,
              private readonly modalService: BsModalService,
              private readonly translateService: TranslateService) {
    super(router, route);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.size = 10;
    this.subscriptions.push(
      this.route.parent!.paramMap.subscribe(paramMap => {
        const id = paramMap.get('id');
        if (id) {
          this.guestId = id;
          this.subscribeToQueryParam();
        }
      })
    );
  }

  override retrieveListContent(params: any) {
    super.retrieveListContent(params);
    this.subscriptions.push(
      this.identityDocumentService.getIdentityDocuments(this.guestId, this.page, this.size).subscribe({
        next: (data) => {
          console.log('Identity documents retrieved successfully. API response is:', data);
          super.handleSuccessData(data);
        },
        error: (err) => {
          console.warn('An error occurred when retrieving identity documents. API error is:', err);
        }
      })
    );
  }

  confirmDeletion(identityDocument: IdentityDocumentItemGetModel) {
    let initialState = {
      title: this.translateService.instant('documents.list.delete-modal.title'),
      message: this.translateService.instant('documents.list.delete-modal.message')
    }
    let confirmModalRef = this.modalService.show(ConfirmModalComponent, {initialState});
    this.subscriptions.push((confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(
      () => {
        this.deleteDocument(identityDocument.id);
      }
    ))
  }

  private deleteDocument(identityDocumentId: string) {
    this.subscriptions.push(this.identityDocumentService.deleteDocumentById(identityDocumentId).subscribe({
      next:(res)=>{
        console.log('Identity document with Id:', identityDocumentId, 'removed successfully. API response is:', res);
        this.refreshListContent();
      },
      error:(err)=>{
        console.log('An error occurred during identity document deletion. Error API response is:', err);
      }
    }))
  }

  openIdentityDocumentCuModal(identityDocument?: IdentityDocumentItemGetModel) {
    let initialState = {documentToEdit: identityDocument, guestId: this.guestId}

    let identityDocumentCuModal = this.modalService.show(DocumentCuModalComponent, {initialState});
    this.subscriptions.push(
      (identityDocumentCuModal.content as DocumentCuModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }
}
