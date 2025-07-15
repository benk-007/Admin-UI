import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitDetailTabComponent } from './unit-detail-tab.component';

describe('UnitDetailTabComponent', () => {
  let component: UnitDetailTabComponent;
  let fixture: ComponentFixture<UnitDetailTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitDetailTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitDetailTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
