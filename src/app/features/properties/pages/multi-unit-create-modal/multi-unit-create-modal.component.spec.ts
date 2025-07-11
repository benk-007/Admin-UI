import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiUnitCreateModalComponent } from './multi-unit-create-modal.component';

describe('MultiUnitCreateModalComponent', () => {
  let component: MultiUnitCreateModalComponent;
  let fixture: ComponentFixture<MultiUnitCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiUnitCreateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiUnitCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
