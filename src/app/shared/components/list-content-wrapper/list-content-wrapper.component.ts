import {Component, Input} from '@angular/core';
import {
  ColComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from "@coreui/angular";
import {IconDirective} from "@coreui/icons-angular";
import {TableControlComponent} from "../table-control/table-control.component";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-list-content-wrapper',
  imports: [
    ColComponent,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    RowComponent,
    TableControlComponent,
    TranslatePipe
  ],
  templateUrl: './list-content-wrapper.component.html',
  styleUrl: './list-content-wrapper.component.scss'
})
export class ListContentWrapperComponent {

  @Input()
  icons: any;

  @Input()
  firstCallDone: boolean = false;

  @Input()
  isListEmpty: boolean = false;

  @Input()
  isSearchActive: boolean = false;

}
