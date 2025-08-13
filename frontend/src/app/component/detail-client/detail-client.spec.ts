import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailClient } from './detail-client';

describe('DetailClient', () => {
  let component: DetailClient;
  let fixture: ComponentFixture<DetailClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailClient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailClient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
