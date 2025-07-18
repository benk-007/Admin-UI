import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-unit-rate-table-create-modal',
  imports: [],
  templateUrl: './unit-rate-table-create-modal.component.html',
  styleUrl: './unit-rate-table-create-modal.component.scss'
})
export class UnitRateTableCreateModalComponent {
  ratePlanId!: string;
  unitId!: string;
  @Output() actionConfirmed = new EventEmitter<void>();
}
