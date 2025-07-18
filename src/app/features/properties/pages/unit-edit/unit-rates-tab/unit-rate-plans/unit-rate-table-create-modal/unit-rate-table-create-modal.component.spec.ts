import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitRateTableCreateModalComponent } from './unit-rate-table-create-modal.component';

describe('UnitRateTableCreateModalComponent', () => {
  let component: UnitRateTableCreateModalComponent;
  let fixture: ComponentFixture<UnitRateTableCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitRateTableCreateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitRateTableCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
