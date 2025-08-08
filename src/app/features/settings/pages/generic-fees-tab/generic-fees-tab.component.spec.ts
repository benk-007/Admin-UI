import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFeesTabComponent } from './generic-fees-tab.component';

describe('GenericFeesTabComponent', () => {
  let component: GenericFeesTabComponent;
  let fixture: ComponentFixture<GenericFeesTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericFeesTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericFeesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
