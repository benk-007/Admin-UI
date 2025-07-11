import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitCreateModalComponent } from './unit-create-modal.component';

describe('UnitCreateModalComponent', () => {
  let component: UnitCreateModalComponent;
  let fixture: ComponentFixture<UnitCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitCreateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
