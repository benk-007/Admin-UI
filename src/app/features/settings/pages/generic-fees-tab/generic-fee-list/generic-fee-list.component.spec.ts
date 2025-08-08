import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFeeListComponent } from './generic-fee-list.component';

describe('GenericFeeListComponent', () => {
  let component: GenericFeeListComponent;
  let fixture: ComponentFixture<GenericFeeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericFeeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericFeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
