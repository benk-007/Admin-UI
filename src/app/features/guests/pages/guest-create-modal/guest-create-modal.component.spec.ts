import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestCreateModalComponent } from './guest-create-modal.component';

describe('GuestCreateModalComponent', () => {
  let component: GuestCreateModalComponent;
  let fixture: ComponentFixture<GuestCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestCreateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
