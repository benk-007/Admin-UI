import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCuModalComponent } from './document-cu-modal.component';

describe('DocumentCuModalComponent', () => {
  let component: DocumentCuModalComponent;
  let fixture: ComponentFixture<DocumentCuModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentCuModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentCuModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
