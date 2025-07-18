import { ComponentFixture, TestBed } from '@angular/core/testing';
import {UnitRateTableCuModalComponent} from './unit-rate-table-cu-modal.component';


describe('UnitRateTableCreateModalComponent', () => {
  let component: UnitRateTableCuModalComponent;
  let fixture: ComponentFixture<UnitRateTableCuModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitRateTableCuModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitRateTableCuModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
