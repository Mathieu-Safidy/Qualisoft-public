import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, input, output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Erreur } from '../../interface/Erreur';
import { map, Observable, startWith } from 'rxjs';
import { MatTooltip } from '@angular/material/tooltip';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { k } from "../../../../node_modules/@angular/material/module.d-m-qXd3m8";
import { Debounced } from '../../directive/debounced';
import { DetailProjectService } from '../../service/DetailProjectService';

@Component({
  selector: 'app-type-erreur',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    MatTooltip,
    Debounced
  ],
  templateUrl: './type-erreur.html',
  styleUrl: './type-erreur.css'
})
export class TypeErreur {
  readonly form = input.required<FormGroup>();
  readonly formEtape = input<FormGroup>();
  readonly colonne = input<string[]>([]);
  readonly erreurs = input<any[]>([]);
  readonly verifier = input<any>();
  @Output() addLigne = new EventEmitter<void>();
  @Output() removeLigne = new EventEmitter<number>();
  exist = input<boolean>(false);
  detailService = inject(DetailProjectService);
  projectID = input<number>(-1);
  id_colonne = input<string[] | number[]>([]);
  findIdEtape = input<(id_operation: string) => string>(() => '');
  addErreur = output<any>();
  annuler = output<any>();
  valider = false;

  readonly filteredOperations = input.required<Observable<Erreur[]>[]>();

  ngOnInit() {

    // console.log('erreur init x', this.erreurs())
    const form = this.form();
    // console.log(form.controls["formErreur"]);
    // console.log('form3 = ', form);
    // console.log('formErreur control = ', form.controls['formErreur']);
    // console.log('formGroup.length = ', this.formGroup.length);



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
    const colonne = this.colonne();
    if (colonne.length === 1) {
      const col = colonne[0]; // la seule colonne
      // console.log('this.form1', this.form , this.formGroup[0].get(col));
      this.formGroup[0].get(col)?.setValue(true);
      // console.log('this.form2', this.form , this.formGroup[0].get(col));
    }
    if (colonne.length < 4) {
      let reste = 4 - colonne.length
      console.log(reste);
      for (let index = 0; index < reste; index++) {
        colonne.push("");
      }
    }
    return colonne;
  }

  takeIdEtape(id_operation: string): string {
    const etape_qualite = this.formEtape()?.get('formArray') as FormArray;
    const etape = etape_qualite.controls.find((fg) => (fg as FormGroup).get('operation')?.value === id_operation) as FormGroup | undefined;
    return etape ? etape.get('id_etape_qualite')?.value : '';
  }


  get formGroup() {
    return (this.form().controls["formErreur"] as FormArray).controls as FormGroup[];
  }

  get formArray() {
    return (this.form().controls["formErreur"] as FormArray<FormGroup>)
  }

  valideChange(event: boolean) {
    this.valider = event;
  }

  async updateValue(event: any) {
    let { id, value, name } = event;
    let { id_projet, libelle, index , est_majeur} = value;
    if (typeof value === 'object') {
      if (value.libelle !== null && value.libelle !== undefined) {
        value = { id_projet, libelle };
      } else if (value.est_majeur !== null && value.est_majeur !== undefined) {
        value = est_majeur;
        this.valider = true;
      }
    } else {
      this.valider = true;
    }
    console.log("Debounced event:", event, this.valider);
    console.log("Valeur avant vérification:", this.verify(value.libelle), this.valider);
    console.log("Valeur ajoutée, ", this.erreurs().find(item => (item.type_erreur ?? '').toLowerCase() === (value.libelle ?? '').toLowerCase() ));
    if (!this.verify(value.libelle) && this.valider) {
      let idTo = -1;
      let nameTo = 'detail_projet.erreur_suggestion:libelle';
      let valueTo = { 'libelle': value.libelle };
      this.detailService.updateUnitaire(idTo, valueTo, nameTo).then((res:any) => {
        console.log("Option ajoutée avec succès :", res, this.erreurs());
        if (res.parametre && res.parametre.length > 0 ) {
          let newErreur = { id_erreur: res.parametre[0].id_erreur_suggestion, type_erreur: res.parametre[0].libelle };
          // this.erreurs()?.push(newErreur);
          this.addErreur.emit(newErreur);
          console.log("Valeur ajoutée, ", this.erreurs().find(item => (item.type_erreur ?? '').toLowerCase() === (value.libelle ?? '').toLowerCase() ));
          this.updateValue(event);
          this.valider = false;
        }
      }).catch(err => {
        console.log("Erreur lors de l'ajout d'option");
      });
      console.log("Valeur non valide, mise à jour annulée.");
      return;
    } else if (this.verify(value.libelle) && this.valider) {
      console.log("Valeur existante, ", this.erreurs().find(item => (item.type_erreur ?? '').toLowerCase() === (value.libelle ?? '').toLowerCase() ));
      
      this.detailService.updateUnitaire(id, value, name)
      .then((res : any) => {
        console.log("Update result:", res, this.formGroup[index]);
        this.formGroup[index].patchValue({idErreur: res.parametre[0].id_type_erreur}, { emitEvent: false })
      })
      .catch(err => {
        console.error("Erreur lors de la mise à jour :", err);
      })
    } else {
      console.log("Valeur non valide, mise à jour annulée.", value);
    }
  }

  async updateValueCheck(event: any) {
    let { id, value, name } = event;
    let id_etape = this.takeIdEtape(value.id_operation);
    let { validite, id_operation, id_type_erreur, champ } = value;
    let updateValue = { 'id_etape_qualite': id_etape, 'id_type_erreur': id_type_erreur };
    console.log("Debounced event:", event, 'update value ', updateValue, 'name', champ);
    let result: any = null;
    if (validite) {
      id = -1;
      let checker = this.formArray.at(champ.index).get(champ.col);
      let form = this.formArray.at(champ.index).value;
      // if (this.verify(updateValue.))
      this.detailService.updateUnitaire(id, updateValue, name).then(res => {
        console.log("Update result:", res);
        checker?.setValue(form[champ.col], { emitEvent: false });
      }).catch(err => {
        checker?.setValue(form[champ.col], { emitEvent: false });
        alert("Erreur lors de l'ajout d'option");
      });
      console.log("Update result insert:", this.formArray.at(champ.index).value);
    } else {
      id = 0;
      result = await this.detailService.updateUnitaire(id, updateValue, name, true)
      console.log("Update result delete :", result,);
    }
  }

  verify(value: string): boolean {
    if (this.erreurs()) {
      return this.erreurs().some(item => (item.type_erreur ?? '').toLowerCase() === (value ?? '').toLowerCase() );
    }
    return false;
  }

  checkValid() {
    console.log(this.form().valid, (this.form().controls["formErreur"] as FormArray).valid, this.form());
  }

  triggerAdd() {
    this.addLigne.emit();
  }

  trigerRemove(index: number) {

    let id = this.formArray.at(index).get('idErreur')?.value;
    let name = 'detail_projet.type_erreur';
    this.detailService.deleteDonne(id, name)
    .then(res => {
      if (res) {
        this.removeLigne.emit(index);
      }
    })
    .catch((err: any) => {
      alert("Erreur lors de la suppression de l'erreur " + err.message);
    });
  }

  displayErreur = (id: string): string => {
    const erreurs = this.erreurs();
    if (!erreurs) return '';
    const operations = erreurs.find((l: any) => l.id_erreur.toString() === id);
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
