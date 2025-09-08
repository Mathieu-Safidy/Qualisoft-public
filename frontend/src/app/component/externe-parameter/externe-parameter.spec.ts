import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExterneParameter } from './externe-parameter';

describe('ExterneParameter', () => {
  let component: ExterneParameter;
  let fixture: ComponentFixture<ExterneParameter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExterneParameter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExterneParameter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
