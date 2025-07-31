import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubUnitCreateModalComponent } from './sub-unit-create-modal.component';

describe('SubUnitCreateModalComponent', () => {
  let component: SubUnitCreateModalComponent;
  let fixture: ComponentFixture<SubUnitCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubUnitCreateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubUnitCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
