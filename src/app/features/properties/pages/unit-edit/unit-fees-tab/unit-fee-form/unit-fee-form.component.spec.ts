import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitFeeFormComponent } from './unit-fee-form.component';

describe('UnitFeeFormComponent', () => {
  let component: UnitFeeFormComponent;
  let fixture: ComponentFixture<UnitFeeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitFeeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitFeeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
