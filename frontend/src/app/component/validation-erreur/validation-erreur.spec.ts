import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationErreur } from './validation-erreur';

describe('ValidationErreur', () => {
  let component: ValidationErreur;
  let fixture: ComponentFixture<ValidationErreur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationErreur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationErreur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
