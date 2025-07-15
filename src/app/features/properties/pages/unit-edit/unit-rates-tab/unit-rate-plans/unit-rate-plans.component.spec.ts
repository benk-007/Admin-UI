import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitRatePlansComponent } from './unit-rate-plans.component';

describe('UnitRatePlansComponent', () => {
  let component: UnitRatePlansComponent;
  let fixture: ComponentFixture<UnitRatePlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitRatePlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitRatePlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
