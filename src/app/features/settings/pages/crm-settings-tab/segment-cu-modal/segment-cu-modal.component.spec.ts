import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentCuModalComponent } from './segment-cu-modal.component';

describe('SegmentCuModalComponent', () => {
  let component: SegmentCuModalComponent;
  let fixture: ComponentFixture<SegmentCuModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegmentCuModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SegmentCuModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
