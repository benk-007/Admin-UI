import { TestBed } from '@angular/core/testing';

import { UnitMapperService } from './unit-mapper.service';

describe('UnitMapperService', () => {
  let service: UnitMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
