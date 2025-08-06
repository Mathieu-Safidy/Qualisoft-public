import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Corp } from './corp';

describe('Corp', () => {
  let component: Corp;
  let fixture: ComponentFixture<Corp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Corp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Corp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
