import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitRoomBeddingTabComponent } from './unit-room-bedding-tab.component';

describe('UnitRoomBeddingTabComponent', () => {
  let component: UnitRoomBeddingTabComponent;
  let fixture: ComponentFixture<UnitRoomBeddingTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitRoomBeddingTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitRoomBeddingTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
