import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFeeEditModalComponent } from './generic-fee-edit-modal.component';

describe('GenericFeeEditModalComponent', () => {
  let component: GenericFeeEditModalComponent;
  let fixture: ComponentFixture<GenericFeeEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericFeeEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericFeeEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
