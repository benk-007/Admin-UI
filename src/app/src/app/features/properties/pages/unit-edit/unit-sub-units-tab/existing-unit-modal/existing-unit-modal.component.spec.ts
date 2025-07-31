import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingUnitModalComponent } from './existing-unit-modal.component';

describe('ExistingUnitModalComponent', () => {
  let component: ExistingUnitModalComponent;
  let fixture: ComponentFixture<ExistingUnitModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExistingUnitModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExistingUnitModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
