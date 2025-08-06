import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeErreur } from './type-erreur';

describe('TypeErreur', () => {
  let component: TypeErreur;
  let fixture: ComponentFixture<TypeErreur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeErreur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeErreur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
