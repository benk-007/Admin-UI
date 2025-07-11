import {Component, Input} from '@angular/core';
import {ColComponent, RowComponent} from "@coreui/angular";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-empty-data',
  imports: [
    RowComponent,
    ColComponent
  ],
  templateUrl: './empty-data.component.html',
  standalone: true,
  styleUrl: './empty-data.component.scss'
})
export class EmptyDataComponent {
  @Input()
  imageSrc!: string;

  @Input()
  message!: string;

  constructor(private readonly translateService: TranslateService) {
    this.message = this.translateService.instant('commons.snippets.no-result')
  }
}
