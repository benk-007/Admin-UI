import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitRatePlansCreateModalComponent } from './unit-rate-plans-create-modal.component';

describe('UnitRatePlansCreateModalComponent', () => {
  let component: UnitRatePlansCreateModalComponent;
  let fixture: ComponentFixture<UnitRatePlansCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitRatePlansCreateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitRatePlansCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
