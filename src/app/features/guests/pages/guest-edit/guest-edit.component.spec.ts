import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestEditComponent } from './guest-edit.component';

describe('GuestEditComponent', () => {
  let component: GuestEditComponent;
  let fixture: ComponentFixture<GuestEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
