import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingTabsComponent } from './setting-tabs.component';

describe('SettingTabsComponent', () => {
  let component: SettingTabsComponent;
  let fixture: ComponentFixture<SettingTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
