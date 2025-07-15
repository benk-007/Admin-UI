import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitDefaultRateComponent } from './unit-default-rate.component';

describe('UnitDefaultRateComponent', () => {
  let component: UnitDefaultRateComponent;
  let fixture: ComponentFixture<UnitDefaultRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitDefaultRateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitDefaultRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
