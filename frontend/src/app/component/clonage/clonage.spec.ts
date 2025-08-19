import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clonage } from './clonage';

describe('Clonage', () => {
  let component: Clonage;
  let fixture: ComponentFixture<Clonage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clonage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Clonage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
