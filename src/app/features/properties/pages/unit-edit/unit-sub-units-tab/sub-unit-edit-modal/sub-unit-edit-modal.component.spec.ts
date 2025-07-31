import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubUnitEditModalComponent } from './sub-unit-edit-modal.component';

describe('SubUnitEditModalComponent', () => {
  let component: SubUnitEditModalComponent;
  let fixture: ComponentFixture<SubUnitEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubUnitEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubUnitEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
