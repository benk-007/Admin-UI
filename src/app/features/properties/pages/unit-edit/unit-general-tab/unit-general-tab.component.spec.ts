import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitGeneralTabComponent } from './unit-general-tab.component';

describe('UnitGeneralTabComponent', () => {
  let component: UnitGeneralTabComponent;
  let fixture: ComponentFixture<UnitGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitGeneralTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
