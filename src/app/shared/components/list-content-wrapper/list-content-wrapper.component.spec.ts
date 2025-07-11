import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListContentWrapperComponent } from './list-content-wrapper.component';

describe('ListContentWrapperComponent', () => {
  let component: ListContentWrapperComponent;
  let fixture: ComponentFixture<ListContentWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListContentWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListContentWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
