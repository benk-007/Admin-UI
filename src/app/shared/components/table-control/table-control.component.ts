import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
  ButtonDirective,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  RowComponent
} from "@coreui/angular";
import {TranslatePipe} from '@ngx-translate/core';

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
    TranslatePipe,
  ],
  templateUrl: './table-control.component.html',
  standalone: true,
  styleUrl: './table-control.component.scss'
})
export class TableControlComponent {
  @Input()
  currentNumberElements!: number;

  @Input()
  sizeArray: number[] = [10, 20, 50, 100];

  @Input()
  hasPrevious: boolean = false;

  @Input()
  hasNext: boolean = false;

  @Output()
  sizeChanged = new EventEmitter<number>();

  @Output()
  nextClicked = new EventEmitter<boolean>();

  @Output()
  previousClicked = new EventEmitter<boolean>();

  @Input()
  size: number = 10;

  @Input()
  page: number = 0;

  @Input()
  totalElements?: number = undefined;

  get paginationInfo() {
    return this.currentNumberElements;
  }

  changeSize(el: number) {
    this.size = el;
    this.sizeChanged.emit(this.size);
  }
}
