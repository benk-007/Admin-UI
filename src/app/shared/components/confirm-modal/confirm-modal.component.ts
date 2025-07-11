import {Component, EventEmitter, Output} from '@angular/core';
import {BsModalRef} from "ngx-bootstrap/modal";
import {TranslateModule} from "@ngx-translate/core";
import {ButtonDirective, ColComponent, RowComponent} from "@coreui/angular";

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [
        TranslateModule,
        ColComponent,
        RowComponent,
        ButtonDirective
    ],
    templateUrl: './confirm-modal.component.html',
    styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {

    title!: string;

    // Input variables
    message!: string;
    additionalMessage!: string;

    // Output variables
    @Output() actionConfirmed = new EventEmitter<string>();
    @Output() actionCanceled = new EventEmitter();

    constructor(public modalRef: BsModalRef) {
    }

    confirmAction(): void {
        this.actionConfirmed.emit();
        this.modalRef.hide();
    }

    cancelAction(): void {
        this.actionCanceled.emit();
        this.modalRef.hide();
    }
}
