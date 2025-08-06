import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectifQualite } from './objectif-qualite';

describe('ObjectifQualite', () => {
  let component: ObjectifQualite;
  let fixture: ComponentFixture<ObjectifQualite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectifQualite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjectifQualite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
