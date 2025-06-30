import { TestBed } from '@angular/core/testing';

import { DevendService } from './devenv.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('DevendService', () => {
  let service: DevendService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            provideHttpClient(),
            provideHttpClientTesting(),            
        ]
    });
    service = TestBed.inject(DevendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
