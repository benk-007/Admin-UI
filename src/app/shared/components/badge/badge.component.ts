import {Component, Input} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-badge',
  imports: [
    NgClass
  ],
  templateUrl: './badge.component.html',
  standalone: true,
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {

  @Input()
  rounded: boolean = false;

  @Input()
  color: string = 'primary';

  getBgClass() {
    switch (this.color) {
      case 'primary':
        return 'bg-primary-transparent';
      case 'secondary':
        return 'bg-secondary-transparent';
      case 'info':
        return 'bg-info-transparent';
      case 'danger':
        return 'bg-danger-transparent';
      default:
        return 'bg-primary-transparent';
    }
  }
}
