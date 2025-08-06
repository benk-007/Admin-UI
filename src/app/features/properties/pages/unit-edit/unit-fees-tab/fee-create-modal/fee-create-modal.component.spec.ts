import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeCreateModalComponent } from './fee-create-modal.component';

describe('FeeCreateModalComponent', () => {
  let component: FeeCreateModalComponent;
  let fixture: ComponentFixture<FeeCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeCreateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeeCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
