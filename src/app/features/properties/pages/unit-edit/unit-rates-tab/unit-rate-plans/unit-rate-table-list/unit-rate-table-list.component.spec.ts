import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitRateTableListComponent } from './unit-rate-table-list.component';

describe('UnitRateTableListComponent', () => {
  let component: UnitRateTableListComponent;
  let fixture: ComponentFixture<UnitRateTableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitRateTableListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitRateTableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
