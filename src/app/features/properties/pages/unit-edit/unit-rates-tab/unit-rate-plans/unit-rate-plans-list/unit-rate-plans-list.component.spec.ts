import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitRatePlansListComponent } from './unit-rate-plans-list.component';

describe('UnitRatePlansListComponent', () => {
  let component: UnitRatePlansListComponent;
  let fixture: ComponentFixture<UnitRatePlansListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitRatePlansListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitRatePlansListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
