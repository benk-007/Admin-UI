import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartySelectComponent } from './party-select.component';

describe('PartySelectComponent', () => {
  let component: PartySelectComponent;
  let fixture: ComponentFixture<PartySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartySelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
