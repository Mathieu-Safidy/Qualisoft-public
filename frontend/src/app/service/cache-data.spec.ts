import { TestBed } from '@angular/core/testing';

import { CacheData } from './cache-data';

describe('CacheData', () => {
  let service: CacheData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
