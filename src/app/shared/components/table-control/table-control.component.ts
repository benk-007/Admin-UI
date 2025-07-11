import {Component} from '@angular/core';
import {
  ButtonDirective,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  RowComponent
} from "@coreui/angular";
import {IconDirective} from "@coreui/icons-angular";
import {cilChevronLeft, cilChevronRight} from "@coreui/icons";

@Component({
  selector: 'app-table-control',
  imports: [
    RowComponent,
    ColComponent,
    DropdownComponent,
    ButtonDirective,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    IconDirective
  ],
  templateUrl: './table-control.component.html',
  standalone: true,
  styleUrl: './table-control.component.scss'
})
export class TableControlComponent {
  icons = {cilChevronLeft, cilChevronRight}

}
