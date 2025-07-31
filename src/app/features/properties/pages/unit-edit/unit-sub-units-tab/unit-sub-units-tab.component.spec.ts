import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitSubUnitsTabComponent } from './unit-sub-units-tab.component';

describe('UnitSubUnitsTabComponent', () => {
  let component: UnitSubUnitsTabComponent;
  let fixture: ComponentFixture<UnitSubUnitsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitSubUnitsTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitSubUnitsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
