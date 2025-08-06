import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Erreur } from '../../interface/Erreur';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-type-erreur',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './type-erreur.html',
  styleUrl: './type-erreur.css'
})
export class TypeErreur {
  @Input() form !: FormGroup;
  @Input() colonne: string[] = [];
  @Input() erreurs: Erreur[] = [];
  @Output() addLigne = new EventEmitter<void>();
  @Output() removeLigne = new EventEmitter<number>();


  @Input() filteredOperations !: Observable<Erreur[]>[];

  ngOnInit() {

    console.log('erreur init x', this.erreurs)
    console.log(this.form.controls["formErreur"]);
    console.log('form3 = ', this.form);
    console.log('formErreur control = ', this.form.controls['formErreur']);
    console.log('formGroup.length = ', this.formGroup.length);



    // this.filteredOperations = this.formGroup.map((fg, i) =>
    //   fg.get('typeErreur')!.valueChanges.pipe(
    //     startWith(''),
    //     map(value => {
    //       console.log('valueChanges déclenché pour ligne', i, 'valeur:', value);
    //       return this._filter(value || '');
    //     })
    //   )
    // );
    // console.log("Form dans erreur", this.form);
  }

  lister(): string[] {
    if (this.colonne.length === 1) {
      const col = this.colonne[0]; // la seule colonne
      // console.log('this.form1', this.form , this.formGroup[0].get(col));
      this.formGroup[0].get(col)?.setValue(true);
      // console.log('this.form2', this.form , this.formGroup[0].get(col));
    }
    if (this.colonne.length < 4) {
      let reste = 4 - this.colonne.length
      console.log(reste);
      for (let index = 0; index < reste; index++) {
        this.colonne.push("");
      }
    }
    return this.colonne;
  }



  get formGroup() {
    return (this.form.controls["formErreur"] as FormArray).controls as FormGroup[];
  }

  checkValid() {
    console.log(this.form.valid, (this.form.controls["formErreur"] as FormArray).valid, this.form);
  }

  triggerAdd() {
    this.addLigne.emit();
  }

  trigerRemove(index: number) {
    this.removeLigne.emit(index);
  }

  displayErreur = (id: string): string => {
    if (!this.erreurs) return '';
    const operations = this.erreurs.find(l => l.id_erreur.toString() === id);
    return operations ? operations.type_erreur : '';
  }

  formatSeuilQualite(index: number): void {
    const ctrl = this.formGroup.at(index)?.get('coef');
    let value = ctrl?.value;

    if (value !== null && value !== undefined) {
      value = value.toString().replace(',', '.');
      let num = parseFloat(value);
      if (!isNaN(num)) {
        num = Math.round(num * 100) / 100;
        if (num > 100) {
          alert("La valeur ne peut pas dépasser 100%");
          num = 0;
        } else if (num < 0) {
          alert("La valeur ne peut pas être négative");
          num = 0;
        }
        ctrl?.setValue(num);
      }
    }
  }

  filterInput(event: KeyboardEvent): void {
    const allowed = /[0-9.,]/;
    if (!allowed.test(event.key)) {
      event.preventDefault();
    }
  }
}
