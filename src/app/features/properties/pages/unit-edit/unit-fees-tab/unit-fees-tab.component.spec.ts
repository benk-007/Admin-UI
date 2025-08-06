import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitFeesTabComponent } from './unit-fees-tab.component';

describe('UnitFeesTabComponent', () => {
  let component: UnitFeesTabComponent;
  let fixture: ComponentFixture<UnitFeesTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitFeesTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitFeesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
