import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyFeesToModalComponent } from './copy-fees-to-modal.component';

describe('CopyFeesToModalComponent', () => {
  let component: CopyFeesToModalComponent;
  let fixture: ComponentFixture<CopyFeesToModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyFeesToModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopyFeesToModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
