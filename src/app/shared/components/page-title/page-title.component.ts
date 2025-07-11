import {Component, Input} from '@angular/core';
import {ColComponent, RowComponent} from "@coreui/angular";
import {TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-page-title',
  imports: [
    ColComponent,
    RowComponent,
    TitleCasePipe
  ],
  templateUrl: './page-title.component.html',
  styleUrl: './page-title.component.scss'
})
export class PageTitleComponent {

  @Input()
  title!: string;

}
