import {Component, Input} from '@angular/core';
import {ColComponent, RowComponent} from "@coreui/angular";

@Component({
  selector: 'app-page-title',
  imports: [
    ColComponent,
    RowComponent
  ],
  templateUrl: './page-title.component.html',
  styleUrl: './page-title.component.scss'
})
export class PageTitleComponent {

  @Input()
  title!: string;

}
