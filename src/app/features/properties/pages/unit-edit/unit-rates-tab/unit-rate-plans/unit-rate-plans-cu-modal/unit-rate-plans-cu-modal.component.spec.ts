import { ComponentFixture, TestBed } from '@angular/core/testing';
import {UnitRatePlansCuModalComponent} from './unit-rate-plans-cu-modal.component';


describe('UnitRatePlansCreateModalComponent', () => {
  let component: UnitRatePlansCuModalComponent;
  let fixture: ComponentFixture<UnitRatePlansCuModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitRatePlansCuModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitRatePlansCuModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
