import { TestBed } from '@angular/core/testing';

import { PlantDataService } from './plant-data.service';

describe('PlantDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlantDataService = TestBed.get(PlantDataService);
    expect(service).toBeTruthy();
  });
});
