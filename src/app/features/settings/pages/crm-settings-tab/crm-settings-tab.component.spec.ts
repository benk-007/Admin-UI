import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmSettingsTabComponent } from './crm-settings-tab.component';

describe('CrmSettingsTabComponent', () => {
  let component: CrmSettingsTabComponent;
  let fixture: ComponentFixture<CrmSettingsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmSettingsTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmSettingsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
