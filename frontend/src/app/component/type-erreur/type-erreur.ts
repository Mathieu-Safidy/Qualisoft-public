import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, effect, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Erreur } from '../../interface/Erreur';
import { firstValueFrom, map, Observable, startWith } from 'rxjs';
import { MatTooltip } from '@angular/material/tooltip';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { a, k } from "../../../../node_modules/@angular/material/module.d-m-qXd3m8";
import { Debounced } from '../../directive/debounced';
import { DetailProjectService } from '../../service/DetailProjectService';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatDialog } from '@angular/material/dialog';
import { Confirm } from '../confirm/confirm';
import { E } from '@angular/cdk/keycodes';
import { Operation } from '../../interface/Operation';

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
    Debounced,
    ToastModule
  ],
  templateUrl: './type-erreur.html',
  styleUrl: './type-erreur.css'
})
export class TypeErreur {
  form = input.required<FormGroup>();
  readonly formEtape = input<FormGroup>();
  readonly colonne = input<string[]>([]);
  readonly erreurs = input<any[]>([]);
  readonly verifier = input<any>();
  fb = inject(FormBuilder);
  colonneObserve = input<Observable<{ name: string, id: string | number }[]>>(new Observable<{ name: string, id: string | number }[]>());
  colonneReactif = input<{ name: string, id: string | number }[]>([])
  @Output() addLigne = new EventEmitter<void>();
  @Output() removeLigne = new EventEmitter<number>();
  exist = input<boolean>(false);
  detailService = inject(DetailProjectService);
  projectID = input<number>(-1);
  id_colonne = input<string[] | number[]>([]);
  findIdEtape = input<(id_operation: string) => string>(() => '');
  operations = input<Operation[]>([]);
  operationAcontrollerFiltrer = input<{ operation: any, libelle: string, operationAController: any[] }[]>([]);
  addErreur = output<any>();
  annuler = output<any>();
  operationAcontrole = input<{ [operation: string]: { operationAcontroller: string, name: string, valid: boolean, operation: string }[]; }>();
  updateEtape = output<any>();
  valider = false;
  rollback = false;
  messageService = inject(MessageService);
  private dialog = inject(MatDialog);
  operation_a_controller = signal<{ operationAcontroller: string, name: string, valid: boolean, operation: string }[][]>([]);
  // compute = computed((operation, index) => {
  //   this.updateUnitControledValue(this.operationAcontrole(), operation, index);
  //   console.log('Computed operation_a_controller', this.operation_a_controller());
  //   return this.operation_a_controller();
  // });
  readonly filteredOperations = input.required<Observable<Erreur[]>[]>();
  readonly filteredOperationsSignal = input<Array<Erreur[]>>([]);

  async afficher(index: number) {
    let formgroup = (this.form().controls["formErreur"] as FormArray).controls as FormGroup[];
    let operation = formgroup[index];
    console.log('form group afficher', operation);
    // let cols: { name: string; id: string | number; }[] = await firstValueFrom(this.colonneObserve() as any);
    // let cols: { name: string; id: string | number; }[] = await firstValueFrom(this.colonneObserve() as any);
    let cols: { name: string; id: string | number; }[] = this.colonneReactif();
    for (let i = 0; i < cols.length; i++) {
      let name = cols[i].name;
      let id = cols[i].id;

      let col = operation.get(name);
      let id_operation = this.id_colonne()[i];
      // console.log('Colonne ',col,' suit id operation = ', id_operation);

    }
    // this.updateUnitControledValue(this.operationAcontrole(), operation, index);
    return this.operation_a_controller()[index] || [];
  }

  constructor() {
    effect(() => {
      // console.log("appel operation filtrer", firstValueFrom(this.filteredOperations() as any));

      const form = this.form();
      if (!form) return;
      // group = this.fb.group({
      //     idErreur: [value.id_type_erreur || -1],
      //     typeErreur: [value.libelle_erreur || '', Validators.required],
      //     degre: [value.est_majeur ? 1 : 0, Validators.required],
      //     coef: [value.coef || 0, Validators.required],
      //     raccourci: [value.raccourci || '', Validators.required],
      //   });
      this.ensureControl(form, 'formErreur', this.fb.array([]));
      const formErreur = form.get('formErreur') as FormArray;

      // On boucle sur chaque FormGroup du FormArray
      let colonne = ['idErreur', 'typeErreur', 'degre', 'coef', 'raccourci'];
      if (formErreur.length === 0) {
        const newRow = this.fb.group({});
        colonne.forEach(col => newRow.addControl(col, this.fb.control('')));
        formErreur.push(newRow);
      }
      formErreur.controls.forEach((fg: AbstractControl) => {
        if (fg instanceof FormGroup) {
          colonne.forEach(col => {
            if (fg.get(col)) {
              // fg.addControl(col, this.fb.control(''));
              this.ensureControl(fg, col, this.fb.control(''));
            }
          });
        }
      });
    }
    );
  }

  verifyValue(item: any): boolean {
    let result = this.getOperationControllerErreur(item.operationAcontroller).length > 0;
    console.log('verifyValue for item', item, ':', result, ' in ', result ? true : false);
    return result ? true : false;
  }

  getOperationControllerErreur(typeErreur: string) {
    let erreur = this.verifier().erreur;
    let operationController = erreur.filter((e: any) => e.operation_a_controller === typeErreur)?.map((e: any) => e.operation_a_controller) || [];
    console.log('Operation Controller for typeErreur', typeErreur, ':', operationController, erreur);
    return operationController;
  }


  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: message
    });
  }

  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message
    });
  }

  ngOnInit() {
    // this.initFormGroup();
    // console.log('erreur init x', this.erreurs())
    // const form = this.form();
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
    // this.colonneObserve().subscribe(col => {
    //   console.log('colonneObserve', col);
    // })
  }

  ngAfterViewInit() {
    this.updateAllControledValue(this.operationAcontrole());
  }

  private ensureControl(form: FormGroup, name: string, control: AbstractControl) {
    if (!form.get(name)) {
      form.addControl(name, control);
    }
  }


  initFormGroup() {

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
      // console.log(reste);
      for (let index = 0; index < reste; index++) {
        colonne.push("");
      }
    }
    return colonne;
  }

  takeEtape(
    id_operation: string,
    id_controlle: string,
    egale: boolean = true,
    deleted: boolean = false,
    option: { formerreur?: FormGroup[] } = {}
  ): FormGroup | undefined {
    const etapeArray = this.formEtape()?.get('formArray');

    if (!(etapeArray instanceof FormArray)) return undefined;

    console.log('Étape', id_operation, '→ opération à contrôler');

    const etapes = etapeArray as FormArray;

    // 🔹 Cas 1 : contrôle indéfini ou supprimé
    if (id_controlle === 'indefinie' || !id_controlle || deleted) {
      return etapes.controls.find(
        fg => (fg as FormGroup).get('operation')?.value === id_operation
      ) as FormGroup | undefined;
    }

    // 🔹 Cas 2 : recherche spécifique
    const etape = etapes.controls.find(fg => {
      const fgGroup = fg as FormGroup;
      const operation = fgGroup.get('operation')?.value;
      const operation_a_controller = fgGroup.get('operationAControler')?.value;

      console.log('→ Vérification id étape', fgGroup, id_controlle);

      // ✅ Cas exact : operationAControler == id_controlle
      if (egale && operation === id_operation && operation_a_controller === id_controlle) {
        return true;
      }

      // ✅ Cas différent : operationAControler != id_controlle
      if (!egale && operation === id_operation && operation_a_controller !== id_controlle) {
        // Si une liste d’erreurs est fournie
        if (option.formerreur?.length) {
          const dejaChoisi = new Map<string, string>();

          for (const ctrl of option.formerreur) {
            const ops = ctrl.get('operation_a_controller')?.value;
            if (Array.isArray(ops)) {
              for (const op of ops) {
                if (op.valid && !dejaChoisi.has(op.name)) {
                  dejaChoisi.set(op.name, op.operationAcontroller);
                }
              }
            }
          }

          console.log('Déjà choisis :', dejaChoisi, operation_a_controller);

          // Vérifie si l’opération actuelle fait partie des valeurs déjà choisies
          return !Array.from(dejaChoisi.values()).includes(operation_a_controller);
        }

        return true;
      }

      return false;
    }) as FormGroup | undefined;

    return etape ?? undefined;
  }


  // takeEtape(id_operation: string, id_controlle: string, egale: boolean = true, deleted: boolean = false, option: { formerreur?: FormGroup[] } = {}): FormGroup | undefined {
  //   const etape_qualite_control = this.formEtape()?.get('formArray');
  //   let etape: FormGroup | undefined;
  //   console.log('etape', id_operation, 'operation a controller');

  //   if (etape_qualite_control instanceof FormArray) {
  //     const etape_qualite = etape_qualite_control as FormArray;
  //     if (id_controlle === 'indefinie' || !id_controlle || deleted) {
  //       etape = etape_qualite.controls.find((fg) => (fg as FormGroup).get('operation')?.value === id_operation) as FormGroup | undefined;
  //     } else {
  //       etape = etape_qualite.controls.find((fg) => {
  //         const fgGroup = fg as FormGroup;
  //         const operation_a_controller = fgGroup.get('operationAControler')?.value;
  //         const operation = fgGroup.get('operation')?.value;
  //         console.log('trouver id etape', fgGroup, id_controlle);
  //         if (egale && operation_a_controller && operation && operation_a_controller === id_controlle && operation === id_operation) {
  //           return fgGroup;
  //         } else if (!egale && operation === id_operation && operation_a_controller !== id_controlle) {
  //           if (option.formerreur) {
  //             const operationAcontrollerArray = option.formerreur as FormGroup[];

  //             console.log('trouver valid ', operationAcontrollerArray);
  //             // const trouverNonValable =  operationAcontrollerArray.find((ctrl) => ctrl.get('valid')?.value === false && ctrl.get('operation')?.value === id_operation && ctrl.get('operationAControler')?.value !== id_controlle) ? fgGroup : undefined;
  //             let dejachoisi:Map<string, string> = new Map<string, string>();
  //             operationAcontrollerArray.forEach((ctrl) => {
  //               let operationAcontrollerValue = ctrl.get('operation_a_controller')?.value;
  //               operationAcontrollerValue.forEach((op: any) => {
  //                 if (op.valid && !dejachoisi.has(op.name)) {
  //                   dejachoisi.set(op.name, op.operationAcontroller);
  //                 }
  //               });
  //             })
  //             console.log('deja choisi',dejachoisi);

  //             if (operation_a_controller && Array.from(dejachoisi.values()).includes(operation_a_controller)) {
  //               return fgGroup;
  //             } else {
  //               return undefined;
  //             }

  //           }
  //           return fgGroup;
  //         }
  //         else {
  //           return undefined;
  //         }
  //       }) as FormGroup | undefined;
  //     }
  //     return etape ?? undefined;
  //   }
  //   return undefined;
  // }


  get formGroup() {
    // console.log('formGroup liste', (this.form().controls["formErreur"] as FormArray).value);
    // (this.form().controls["formErreur"] as FormArray).controls.forEach((fg, index) => {
    //   fg = fg as FormGroup;
    //   console.log('formGroup fg', fg, index, fg.value);

    // });
    // return [];
    return (this.form().controls["formErreur"] as FormArray).controls as FormGroup[];
  }

  getOperationsController(i: number) {
    return (this.formGroup.at(i)?.get('operation_a_controller') as FormArray)?.controls as FormGroup[];
  }

  getOperationName(i: number, index: number): string {
    let result = (
      (this.formGroup.at(i)?.get('operation_a_controller') as FormArray)
        ?.at(index)
        ?.get('name')
        ?.value
    );
    console.log('getOperationName', i, index, result);
    return result;
  }


  get formArray() {
    return (this.form().controls["formErreur"] as FormArray<FormGroup>)
  }


  verifierName(i: number, item: any, fg: any) {
    if (this.operation_a_controller() && this.operation_a_controller().length > 0) {
      // console.log('controled',this.operation_a_controller());
      if (this.operation_a_controller() && this.operation_a_controller()[i]?.length > 0) {
        for (let item2 of this.operation_a_controller()[i]) {
          // console.log('this.operations()',this.operations() , item.value , fg , item2);

          let nom = this.operations().find((re: any) => re.id_operation.toString() === item2.operation)?.libelle;
          if (fg.get(nom)?.value === true && item2.name === item.get('name')?.value) {
            return true;
          }
        }
      }
      return false;
      // return this.operation_a_controller()[i].some((re:any) => re.name === (item.get('name')?.value));
    }
    return false;
  }

  valideChange(event: boolean) {
    this.valider = event;
  }

  async updateValue(event: any) {
    let { id, value, name } = event;
    console.log("UpdateValue appelé avec :", event, 'typeof value', typeof value);

    let { id_projet, libelle, index, est_majeur, raccourci } = value;
    // if (libelle && index !== undefined && index !== null) {
    //   let doublageInterdit = this.formGroup.map(fg => fg.get('typeErreur')?.value?.toLowerCase()).some((val, idx) => val === libelle.toLowerCase() && idx !== index);
    //   if (doublageInterdit) {
    //     this.rollback = true;
    //     this.trigerRemove(index);
    //     alert("Doublon d'erreur non accepté");
    //     return;
    //   }
    // }

    if (typeof value === 'object') {
      console.log("Valeur avant vérification type value:", this.verify(libelle), this.valider, value);

      // if (value.libelle !== null && value.libelle !== undefined) {
      //   value = { id_projet, libelle };
      //   console.log('libelle modifié', value);
      // } 
      // if (value.est_majeur !== null && value.est_majeur !== undefined) {
      //   console.log('est_majeur modifié', value.est_majeur);

      //   value = est_majeur;
      //   this.valider = true;
      // } else if (value.raccourci !== null && value.raccourci !== undefined) {
      //   value = raccourci;
      //   console.log('raccourci modifié', value);
      //   this.valider = true;
      // } else if (value.coef !== null && value.coef !== undefined) {
      //   value = value.coef;
      //   console.log('coef modifié', value);

      //   this.valider = true;
      // }
      const champs = [
        { key: 'est_majeur', log: 'est_majeur modifié', transform: () => est_majeur },
        { key: 'raccourci', log: 'raccourci modifié', transform: () => raccourci },
        { key: 'coef', log: 'coef modifié', transform: () => value.coef },
        { key: 'libelle', log: 'libelle modifié', transform: () => ({ id_projet, libelle }) }
      ];

      for (const champ of champs) {
        if (value[champ.key] != null) {
          value = champ.transform();
          console.log(champ.log, value);
          this.valider = true;
          break;
        }
      }
    } else {
      this.valider = true;
    }
    console.log("Debounced event:", event, this.valider);
    console.log("Valeur avant vérification:", this.verify(libelle), this.valider);
    console.log("Valeur ajoutée, ", this.erreurs().find(item => (item.type_erreur ?? '').toLowerCase() === (libelle ?? '').toLowerCase()));
    if (!this.verify(libelle) && this.valider) {
      let idTo = -1;
      let nameTo = 'detail_projet.erreur_suggestion:libelle';
      let valueTo = { 'libelle': libelle };
      this.detailService.updateUnitaire(idTo, valueTo, nameTo).then((res: any) => {
        console.log("Option ajoutée avec succès :", res, this.erreurs());
        if (res.parametre && res.parametre.length > 0) {
          let newErreur = { id_erreur: res.parametre[0].id_erreur_suggestion, type_erreur: res.parametre[0].libelle };
          // this.erreurs()?.push(newErreur);
          this.addErreur.emit(newErreur);
          console.log("Valeur ajoutée, ", this.erreurs().find(item => (item.type_erreur ?? '').toLowerCase() === (libelle ?? '').toLowerCase()));
          this.updateValue(event);
          this.valider = false;
        }
      }).catch(err => {
        console.log("Erreur lors de l'ajout d'option");
      });
      console.log("Valeur non valide, mise à jour annulée.");
      return;
    } else if (this.verify(libelle) && this.valider) {
      console.log("Valeur existante, ", this.erreurs().find(item => (item.type_erreur ?? '').toLowerCase() === (libelle ?? '').toLowerCase()));

      this.detailService.updateUnitaire(id, value, name)
        .then((res: any) => {
          console.log("Update result:", res, this.formGroup[index], index, this.formGroup);
          this.formGroup[index].patchValue({ idErreur: res.parametre[0].id_type_erreur }, { emitEvent: false })
        })
        .catch(err => {
          console.error("Erreur lors de la mise à jour :", err);
        })
    } else {
      console.log("Valeur non valide, mise à jour annulée.", value);
    }
  }

  updateControledValue(listoperation: { [operation: string]: { operationAcontroller: string, name: string, valid: boolean }[]; } | undefined, value: any) {
    if (listoperation) {
      // let operationEtape = Object.entries(listoperation)[value.id_operation];
      let operationEtape = listoperation[value.id_operation];
      this.operation_a_controller.update(old => {
        let copy = [...old];
        copy[value.champ.index] = operationEtape ? (operationEtape as { operationAcontroller: string; name: string; valid: boolean, operation: string }[]) : [];
        return copy;
      })

      let operationDefault = operationEtape ? operationEtape[0] : null;
      if (!operationDefault) {
        console.error("Aucune opération définie dans operationAcontrole");
        return;
      }
      let operationItem = operationDefault;

    }
  }

  async updateAllControledValue(listoperation: { [operation: string]: { operationAcontroller: string, name: string, valid: boolean, operation: string }[]; } | undefined) {
    if (listoperation) {
      for (let index = 0; index < this.formGroup.length; index++) {
        console.log('colonne ', this.id_colonne());
        // let colonneName:{ name: string; id: string | number; }[] = await firstValueFrom(this.colonneObserve() as any);
        let colonneName: { name: string; id: string | number; }[] = this.colonneReactif();
        console.log('colonne reactif', this.colonneReactif());
        for (let index2 = 0; index2 < this.id_colonne().length; index2++) {
          let id_operation = this.id_colonne()[index2];
          let validity = this.formGroup[index].get(colonneName[index2].name)?.value;
          console.log('colone a modifier', colonneName, 'with valdity', validity, 'id_operation', id_operation);
          console.log('form', this.formGroup[index].value);
          if (((this.formGroup[index].get('operation_a_controller') as FormArray<FormGroup>).controls).some(item => item.get('valid')?.value === true)) {
            // if (validity) {
            this.updateUnitControledValue(listoperation, id_operation.toString(), index);
          }
          // }
        }
      }
    }
  }

  // updateUnitControledValue(listoperation: { [operation: string]: { operationAcontroller: string, name: string, valid: boolean, operation: string }[]; } | undefined, id_operation: string | number, index: number) {
  //   if (listoperation) {

  //     // let operationEtape = Object.entries(listoperation)[value.id_operation];
  //     console.log('operation', id_operation , index , this.operation_a_controller());

  //     let operationEtape = listoperation[id_operation];
  //     this.operation_a_controller.update(old => {

  //       const copy = [...old];

  //       // Copie de la ligne existante (1D)
  //       console.log('old operation', copy, operationEtape);

  //       const oldLine = copy[index] || [];
  //       const newLine = copy[index] ? [...oldLine] : [];

  //       // Vérifie si les éléments de operationEtape sont déjà présents
  //       let changed = false;
  //       operationEtape.forEach(op => {
  //         const exists = oldLine.some(
  //           o =>
  //             o.operationAcontroller === op.operationAcontroller &&
  //             o.name === op.name
  //           // && o.valid === op.valid
  //         );
  //         if (!exists) {
  //           newLine.push(op);
  //           changed = true;
  //         }
  //       });

  //       if (!changed) {
  //         // Pas de changement → retourne l'ancien signal
  //         return old;
  //       }

  //       // Met à jour seulement la ligne modifiée
  //       copy[index] = newLine;
  //       return copy;
  //     })

  //     console.log('operation a controler', this.operation_a_controller());


  //     let operationDefault = operationEtape ? operationEtape[0] : null;
  //     if (!operationDefault) {
  //       console.error("Aucune opération définie dans operationAcontrole");
  //       return;
  //     }
  //     let operationItem = operationDefault;

  //   }
  // }
  updateUnitControledValue(
    listoperation: { [operation: string]: { operationAcontroller: string, name: string, valid: boolean, operation: string }[] } | undefined,
    id_operation: string | number,
    index: number
  ) {
    if (!listoperation) return;

    const operationEtape = listoperation[id_operation];
    console.log('List operation ', operationEtape);

    if (!operationEtape) {
      console.warn('Aucune opération pour', id_operation);
      return;
    }

    this.operation_a_controller.update(old => {
      // Crée une copie du tableau principal
      const copy = [...old];

      // 🔹 Assure-toi que toutes les lignes avant l'index existent
      for (let i = 0; i <= index; i++) {
        if (!copy[i]) copy[i] = []; // initialise les lignes manquantes
      }

      // Copie propre de la ligne ciblée
      const currentLine = [...copy[index]];

      // Ajout uniquement des nouvelles opérations non existantes
      let changed = false;
      for (const op of operationEtape) {
        const exists = currentLine.some(
          o =>
            o.operationAcontroller === op.operationAcontroller &&
            o.name === op.name
        );
        if (!exists) {
          currentLine.push(op);
          changed = true;
        }
      }

      if (!changed) return old; // aucune modification réelle

      // ✅ Met à jour seulement la ligne ciblée
      copy[index] = currentLine;
      return copy;
    });

    console.log('✅ Ligne mise à jour à l’index', index, this.formGroup.at(index)?.value, this.operation_a_controller());
  }


  removeUnitControledValue(
    listoperation: { [operation: string]: { operationAcontroller: string; name: string; valid: boolean }[] } | undefined,
    id_operation: string | number,
    index: number
  ) {
    if (!listoperation) return;

    const operationEtape = listoperation[id_operation];
    if (!operationEtape || operationEtape.length === 0) return;

    this.operation_a_controller.update(old => {
      const copy = [...old]; // copie du tableau principal 2D
      const oldLine = copy[index] || [];

      // On supprime tous les éléments qui correspondent à operationEtape
      const newLine = oldLine.filter(
        o => !operationEtape.some(
          op => op.operationAcontroller === o.operationAcontroller && op.name === o.name
        )
      );

      copy[index] = newLine;
      return copy;
    });
  }

  verifierControledDispo(formArray: FormArray, index: number, id_operation: string) {
    const formGroup = formArray.at(index) as FormGroup;
    const operationAcontroller = formGroup.get('operation_a_controller') as FormArray;
    console.log('verification dispo', operationAcontroller);

    if (!operationAcontroller || operationAcontroller.length === 0) {
      return [];
    }
    // Vérifie si toutes les opérations contrôlées sont disponibles
    return operationAcontroller.controls.filter(ctrl => ctrl.get('valid')?.value && ctrl.get('operation')?.value === id_operation) as FormGroup[];
  }

  // verifierDoublonControled(formArray: FormArray, index: number, id_operation: string, operationAcontroller: string) {
  //   let doublon = formArray.controls.some((fg, idx) => {
  //     if (idx !== index) {
  //       let opArray = (fg.get('operation_a_controller') as FormArray).controls as FormGroup[];

  //       if (!opArray) return false;

  //       return opArray.some(op => {
  //         return op.get('operation')?.value === id_operation && op.get('operationAcontroller')?.value === operationAcontroller && op.get('valid')?.value === true;
  //       })
  //     } else {
  //       return false;
  //     }
  //   })
  //   return doublon;
  // }

  verifierDoublonControled(
    typeErreur: string,
    formArray: FormArray,
    index: number,
    id_operation: string,
    operationAcontroller: string
  ): string | null {
    for (let idx = 0; idx < formArray.length; idx++) {
      const fg = formArray.at(idx) as FormGroup;

      if (!fg || idx === index) continue;
      if (fg.get('typeErreur')?.value !== typeErreur) continue;

      console.log('operation', id_operation, idx, index, fg.value);
      const opArray = fg.get('operation_a_controller') as FormArray;
      if (!opArray) continue;

      const doublon = opArray.controls.find(op =>
        op.get('operation')?.value === id_operation &&
        op.get('operationAcontroller')?.value === operationAcontroller &&
        op.get('valid')?.value === true
      );

      if (doublon) {
        console.log('✅ Doublon trouvé :', doublon.value);
        return doublon.get('operationAcontroller')?.value ?? null;
      }
    }

    return null;
  }



  async updateValueCheck(event: any) {
    let { id, value, name } = event;
    try {
      let listoperation = this.operationAcontrole();
      let etape: any = null;
      let { validite, id_operation, id_type_erreur, champ } = value;
      let checker: any = null;
      let colname = this.operations().find(op => op.id_operation.toString() === id_operation.toString())?.libelle || '';
      let principalValidation: any = null;
      console.log('formgroup at ', this.formGroup.at(champ.index)?.value);

      if (value.controled === 'indefinie' || !value.controled) {
        checker = this.formArray.at(champ.index).get(colname);
      } else {
        console.log('form array ', this.formArray);
        let form = this.formArray.at(champ.index).get('operation_a_controller') as FormArray;
        checker = form.controls.find(ctrl => ctrl.get('operationAcontroller')?.value === value.controled)?.get('valid');
        principalValidation = this.formArray.at(champ.index).get(colname);
      }
      // const col = await firstValueFrom(this.colonneObserver.asObservable());
      // if (!value.controled) {
      //   id_etape = this.takeIdEtape(value.id_operation, undefined);
      // } else {
      // }

      let result: any = null;

      if (checker?.value) {
        etape = this.takeEtape(value.id_operation, value.controled);
        let updateValue = { 'id_etape_qualite': etape?.get('id_etape_qualite')?.value, 'id_type_erreur': id_type_erreur };
        console.log('operations', this.operations(), id_operation);

        console.log("Debounced event:", event, 'update value ', updateValue, 'name', champ, 'colname', colname, ' value', value);


        console.log("Valeur avant vérification: validite", this.formArray.at(champ.index)?.get(colname)?.value, 'chekcer', checker?.value);
        id = -1;

        let form = this.formArray.at(champ.index).value;
        // if (this.verify(updateValue.))
        let doublon = this.verifierDoublonControled(value.libelle, this.formArray, champ.index, id_operation, etape.get('operationAControler')?.value);
        console.log('doublon trouver ', value.id_operation, doublon);
        if (!!doublon) {
          if (value.controled === 'indefinie' || !value.controled) {

            etape = this.takeEtape(value.id_operation, doublon, false, false, { formerreur: this.formArray.controls.filter(ctrl => ctrl.get('typeErreur')?.value === value.libelle) as FormGroup[] });
            console.log('etape trouver apart', etape);
            updateValue = { 'id_etape_qualite': etape?.get('id_etape_qualite')?.value, 'id_type_erreur': id_type_erreur };
          } else {
            checker?.setValue(false, { emitEvent: false });
            // this.showError("Ce choix a deja ete fait pour cette erreur");
            throw new Error("Doublon d'opération contrôlée non accepté, Ce choix a deja ete fait pour cette erreur");
          }

        }

        this.detailService.updateUnitaire(id, updateValue, name).then(res => {
          console.log("Update result:", res, etape);

          if (value.controled === 'indefinie' || !value.controled) {
            let aController = etape?.get('operationAControler')?.value;
            let controlAController = this.formArray.at(champ.index).get('operation_a_controller') as FormArray;
            console.log('controls ', controlAController, this.formArray.value, champ);
            
            let checkController = controlAController.controls.find(ctrl => ctrl.get('operationAcontroller')?.value === aController);

            if (checkController) {
              checkController.get('valid')?.setValue(true, { emitEvent: false });
              this.updateUnitControledValue(listoperation, value.id_operation, value.champ.index);
            }
          }

          checker?.setValue(true, { emitEvent: false });
          console.log('Operation total', listoperation, value);


          this.showSuccess("Option ajoutée avec succès");
        }).catch(err => {
          console.log('form pendant erreur', form, checker, err);

          checker?.setValue(false, { emitEvent: false });
          this.showError("Erreur lors de l'ajout d'option , verifier si l'option a deja été cocher" + err.message);
        });

        console.log("Update result insert:", this.formArray.at(champ.index).value);
      } else {

        if (value.controled === 'indefinie' || !value.controled) {
          let valid = this.verifierControledDispo(this.formArray, champ.index, id_operation);
          if (valid.length > 0) {
            valid.map(v => {
              let data = { 'id_etape_qualite': this.takeEtape(v.get('operation')?.value, v.get('operationAcontroller')?.value)?.get('id_etape_qualite')?.value, 'id_type_erreur': id_type_erreur }
              this.detailService.updateUnitaire(id, data, name, true).then(res => {
                v.get('valid')?.setValue(false, { emitEvent: false });
                this.showSuccess("Option supprimée avec succès");
              }).catch(err => {
                this.showError("Erreur lors de la suppression d'option");
              });
            });
          } else {
            etape = this.takeEtape(value.id_operation, value.controled, false, true);
            let updateValue = { 'id_etape_qualite': etape?.get('id_etape_qualite')?.value, 'id_type_erreur': id_type_erreur };
            this.detailService.updateUnitaire(id, updateValue, name, true).then(res => {
              this.showSuccess("Option supprimée avec succès aucune operation contrôlée restante");
              principalValidation?.setValue(false, { emitEvent: false });
            }).catch(err => {
              this.showError("Erreur lors de la suppression d'option\n" + err.message);
            });
          }

          this.removeUnitControledValue(listoperation, value.id_operation, value.champ.index);

        } else {
          etape = this.takeEtape(value.id_operation, value.controled);
          let updateValue = { 'id_etape_qualite': etape?.get('id_etape_qualite')?.value, 'id_type_erreur': id_type_erreur };
          this.detailService.updateUnitaire(id, updateValue, name, true).then(res => {
            console.log("Update result delete :", result);
            checker?.setValue(false, { emitEvent: false });
            console.log("Valeur après suppression:", this.formArray.at(champ.index).value);
            this.showSuccess("Option supprimée avec succès");
          }).catch(err => {
            this.showError("Erreur lors de la suppression d'option\n" + err.message);
          })
        }

        //   this.detailService.updateUnitaire(id, updateValue, name, true).then(res => {
        //     result = res;
        //     console.log('valeur des check ', valid, principalValidation);
        //     // if (valid.length > 0) {
        //     //   valid.map(v => {
        //     //     let data = { 'id_etape_qualite': this.takeEtape(v.get('operation')?.value, v.get('operationAcontroller')?.value)?.get('id_etape_qualite')?.value, 'id_type_erreur': id_type_erreur }
        //     //     this.detailService.updateUnitaire(id, data, name, true).then(res => {
        //     //       this.showSuccess("Option supprimée avec succès");
        //     //     }).catch(err => {
        //     //       this.showError("Erreur lors de la suppression d'option");
        //     //     });
        //     //   });
        //     // }

        //     this.removeUnitControledValue(listoperation, value.id_operation, value.champ.index);
        //   } else {
        //     if(valid.length === 0) {
        //     principalValidation?.setValue(false, { emitEvent: false });
        //     this.removeUnitControledValue(listoperation, value.id_operation, value.champ.index);
        //   }
        // }

        // this.detailService.updateUnitaire(id, updateValue, name, true).then(res => {
        //   result = res;
        //   let valid = this.verifierControledDispo(this.formArray, champ.index, id_operation);
        //   console.log('valeur des check ', valid, principalValidation);
        //   if (value.controled === 'indefinie' || !value.controled) {
        //     if (valid.length > 0) {
        //       valid.map(v => {
        //         let data = { 'id_etape_qualite': this.takeEtape(v.get('operation')?.value, v.get('operationAcontroller')?.value)?.get('id_etape_qualite')?.value, 'id_type_erreur': id_type_erreur }
        //         this.detailService.updateUnitaire(id, data, name, true).then(res => {
        //           this.showSuccess("Option supprimée avec succès");
        //         }).catch(err => {
        //           this.showError("Erreur lors de la suppression d'option");
        //         });
        //       });
        //     }

        //     this.removeUnitControledValue(listoperation, value.id_operation, value.champ.index);
        //   } else {
        //     if (valid.length === 0) {
        //       principalValidation?.setValue(false, { emitEvent: false });
        //       this.removeUnitControledValue(listoperation, value.id_operation, value.champ.index);
        //     }
        //   }

        //   console.log("Update result delete :", result);
        //   checker?.setValue(false, { emitEvent: false });
        //   console.log("Valeur après suppression:", this.formArray.at(champ.index).value);
        //   this.showSuccess("Option supprimée avec succès");

        // }).catch(err => {
        //   this.showError("Erreur lors de la suppression d'option\n"+ err.message);
        // })
      }

    } catch (error: any) {
      this.showError(error.message);
    }
  }

  verify(value: string): boolean {
    if (this.erreurs()) {
      return this.erreurs().some(item => (item.type_erreur ?? '').toLowerCase() === (value ?? '').toLowerCase());
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


    const dialogRef = this.dialog.open(Confirm, {
      data: { message: "Confirmez-vous la suppression de cette erreur ?" }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let id = this.formArray.at(index).get('idErreur')?.value;
        let name = 'detail_projet.type_erreur';
        if (!this.rollback) {
          this.detailService.deleteDonne(id, name)
            .then(res => {
              if (res) {
                this.removeLigne.emit(index);
                this.updateValue
              }
            })
            .catch((err: any) => {
              alert("Erreur lors de la suppression de l'erreur " + err.message);
            });
        } else {
          this.removeLigne.emit(index);
        }
      }
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
function uuidv4(): any {
  throw new Error('Function not implemented.');
}

