import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyFeesFromModalComponent } from './copy-fees-from-modal.component';

describe('CopyFeesFromModalComponent', () => {
  let component: CopyFeesFromModalComponent;
  let fixture: ComponentFixture<CopyFeesFromModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyFeesFromModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopyFeesFromModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
