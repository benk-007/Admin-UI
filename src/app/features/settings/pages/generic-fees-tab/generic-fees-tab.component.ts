import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { GenericFeeListComponent } from './generic-fee-list/generic-fee-list.component';

@Component({
  selector: 'app-generic-fees-tab',
  imports: [
    TranslatePipe,
    GenericFeeListComponent
  ],
  templateUrl: './generic-fees-tab.component.html',
  styleUrl: './generic-fees-tab.component.scss'
})
export class GenericFeesTabComponent {

}
