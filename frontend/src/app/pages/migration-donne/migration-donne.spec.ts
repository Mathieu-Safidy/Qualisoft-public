import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrationDonne } from './migration-donne';

describe('MigrationDonne', () => {
  let component: MigrationDonne;
  let fixture: ComponentFixture<MigrationDonne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MigrationDonne]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MigrationDonne);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
