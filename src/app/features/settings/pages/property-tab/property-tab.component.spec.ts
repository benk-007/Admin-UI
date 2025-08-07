import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyTabComponent } from './property-tab.component';

describe('PropertyTabComponent', () => {
  let component: PropertyTabComponent;
  let fixture: ComponentFixture<PropertyTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
