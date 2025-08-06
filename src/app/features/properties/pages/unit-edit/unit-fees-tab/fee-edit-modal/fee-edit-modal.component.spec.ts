import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeEditModalComponent } from './fee-edit-modal.component';

describe('FeeEditModalComponent', () => {
  let component: FeeEditModalComponent;
  let fixture: ComponentFixture<FeeEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeeEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
