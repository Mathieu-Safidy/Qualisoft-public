import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BcqParameter } from './bcq-parameter';

describe('BcqParameter', () => {
  let component: BcqParameter;
  let fixture: ComponentFixture<BcqParameter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BcqParameter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BcqParameter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
