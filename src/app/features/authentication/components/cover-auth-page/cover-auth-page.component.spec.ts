import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverAuthPageComponent } from './cover-auth-page.component';

describe('CoverAuthPageComponent', () => {
  let component: CoverAuthPageComponent;
  let fixture: ComponentFixture<CoverAuthPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoverAuthPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoverAuthPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
