import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFeeCreateModalComponent } from './generic-fee-create-modal.component';

describe('GenericFeeCreateModalComponent', () => {
  let component: GenericFeeCreateModalComponent;
  let fixture: ComponentFixture<GenericFeeCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericFeeCreateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericFeeCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
