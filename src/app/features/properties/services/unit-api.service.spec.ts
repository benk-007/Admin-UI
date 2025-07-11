import { TestBed } from '@angular/core/testing';

import { UnitApiService } from './unit-api.service';

describe('UnitApiService', () => {
  let service: UnitApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
