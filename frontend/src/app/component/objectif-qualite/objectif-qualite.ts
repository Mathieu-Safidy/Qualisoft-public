import { ChangeDetectorRef, Component, ElementRef, input, Input, output, SimpleChanges, ViewChild } from '@angular/core';
import { Form, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, SelectControlValueAccessor, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FaIconComponent, FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Operation } from '../../interface/Operation';
import { fromEvent, map, Observable, of, startWith } from 'rxjs';
import { DetailProjectService } from '../../service/DetailProjectService';
import { Operations } from '../../class/Operations';
import { Unite } from '../../interface/Unite';
import { v4 as uuidv4 } from 'uuid';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertConfirm } from "../alert-confirm/alert-confirm";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { k } from "../../../../node_modules/@angular/material/module.d-m-qXd3m8";
import { MatTooltip } from '@angular/material/tooltip';
import { Debounced } from '../../directive/debounced';

@Component({
  selector: 'app-objectif-qualite',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ReactiveFormsModule,
    FaIconComponent,
    FontAwesomeModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    NgbPopoverModule,
    MatTooltip,
    Debounced
  ],
  templateUrl: './objectif-qualite.html',
  styleUrl: './objectif-qualite.css'
})
export class ObjectifQualite {
  trackByIndex(index: number, fg: any) {
    return fg.get('id')?.value || index;
  }
  items = [''];

  filteredOperations !: Observable<Operation[]>[];
  form = input<FormGroup>();
  @Input() operations !: Operation[];
  @Input() formPrecedent !: FormGroup;
  unites = input<Unite[]>();
  @Input() verifier: boolean = false;
  verification = input<any>();
  generer = output<void>();
  projectID = input<string | number | null>(null);
  showAlert = false;
  onOperationChange = output<{ id_operation: string, index: number }>();
  updateEtape = output<void>();
  operationSelected!: { index: number, value: string }[];
  filteredOperation: Operation[][] = [];
  optionChoisie: boolean = false;
  // @ViewChild('autOperation') autOperation!: MatAutocomplete;
  ondelete: boolean = false;

  dialogRef: MatDialogRef<AlertConfirm, any> = {} as MatDialogRef<AlertConfirm, any>;

  constructor(private fb: FormBuilder, private cdref: ChangeDetectorRef, private detailService: DetailProjectService, public dialog: MatDialog) {
    this.operationSelected = [{ index: 0, value: '-1' }];
  }

  get formGroups(): FormGroup[] {
    const formArray = this.form()?.controls["formArray"];
    return (formArray as FormArray).controls as FormGroup[];
  }

  get formArray() {
    const formArray = this.form()?.controls["formArray"];
    // console.log('formArray', formArray?.value);
    
    return formArray as FormArray<FormGroup>;
  }

  get formul() {
    return this.form();
  }

  async updateValue(event: any) {
    let { id, value, name } = event;
    console.log("Debounced event:", event);

    if (!value || !id) {
      return;
    }
    let { index, ...reste } = value;
    value = reste;
    if (name.includes('seuil_qualite')) {
        this.formatSeuilQualite(index).subscribe((res) => {
          if (res) {
            console.log('Mety ve ny format');
            
            this.detailService.updateUnitaire(id, value, name, this.ondelete).then((resultat: any) => {
              console.log("Update result:", resultat );
              this.handlerUpdate(resultat, index);
              this.updateEtape.emit();
            });
          } else {
            let valueAncien = this.verification().etape[index]?.seuil_qualite || 0;
            console.log('Format tsy mety',this.formGroups.at(index)?.get('seuilQualite')?.value , 'ancien', valueAncien);
            this.formGroups.at(index)?.get('seuilQualite')?.setValue(valueAncien, { emitEvent: false });
            this.cdref.detectChanges();
          }
        })
    } 
    else {
      let resultat: any = await this.detailService.updateUnitaire(id, value, name, this.ondelete);
      console.log("Update result:", resultat );
      this.handlerUpdate(resultat, index);
      this.updateEtape.emit();
      return;
    }
  }

  handlerUpdate(resultat: any, index: number) {
    if (resultat?.parametre?.length) {
      let param = resultat.parametre[0];
      const interlocuteurs = this.form()?.get('formArray') as FormArray<FormGroup>;
      console.log('parametre', interlocuteurs.controls);

      console.log('index trouvé', index, param);

      if (index !== -1) {
         const group = interlocuteurs.at(index);
        group.get('id_etape_qualite')?.setValue(param.id_etape_qualite, { emitEvent: false });
        this.cdref.detectChanges();
      }
    }
  }
  // get percentage() {
  //   return this.formGroups.at(index)?.get('seuilQualite')?.value;
  // } 

  openAlert(index: number) {
    this.showAlert = true;
    let pourcentage = this.formGroups.at(index)?.get('seuilQualite')?.value;
    console.log("pourcentage ", pourcentage);
    this.dialogRef = this.dialog.open(AlertConfirm, {
      width: 'auto',
      height: 'auto',
      data: { pourcentage: pourcentage }
    });

    return this.dialogRef.afterClosed()
    // .subscribe(result => {
    //   let cotrl = this.formGroups.at(index)?.get('seuilQualite');
    //   // Le `result` est `true` si l'utilisateur a cliqué sur "OK", `false` si "Annuler"
    //   if (result) {
    //     alert(`Action confirmée ! Votre seuil reste à ${pourcentage}%.`);
    //     return true;
    //   } else {
    //     cotrl?.setValue(0);
    //     alert('Action annulée. Votre seuil a été remis à 0%.');
    //     return false;
    //   }
    // });
  }

  // onConfirmed(isConfirmed: boolean) {
  //   let cotrl = this.form()?.get('seuilQualite');
  //   if (isConfirmed) {
  //     alert(`Votre pourcentage de seuil reste le même ${this.percentage}%`);
  //   } else {
  //     alert('Action annulée. Votre pourcentage de seuil a été remis à 0%.');
  //     cotrl?.setValue(0);
  //   }
  //   this.showAlert = false; // Cache l'alerte dans tous les cas
  // }

  ngOnInit() {
    this.filteredOperations = this.formGroups?.map((fg) =>
      fg.get('operation')!.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || ''))
      )
    );

    this.formArray.valueChanges.subscribe((values: any[]) => {
      // this.operationSelected = values.map((v, i) => ({ index: i, value: v.operationAControler }));
      // console.log('ici', this.operationSelected);
      // this.updateFilteredOperations();
    });
    if (this.verifier) {
      this.updateAllOperation();
    } else {
      this.updateFilteredOperations(1);
    }

  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['operations']) {
      console.log('Opérations mises à jour', this.operations);
      // mettre à jour les champs internes ici
      this.filteredOperations = this.formGroups.map((fg) =>
        fg.get('operation')!.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value || ''))
        )
      );
    }
  }

  checkValid() {
    const formArray = this.formArray as FormArray<FormGroup>;
    if (!formArray) {
      console.log('Le formulaire principal ou le FormArray est introuvable.');
      return;
    }

    formArray.controls.forEach((group, index) => {
      const invalidControls = Object.keys(group.controls).filter(controlName => {
        const control = group.get(controlName);
        return control && control.invalid;
      });

      if (invalidControls.length > 0) {
        console.log(`FormGroup à l'index ${index} a des champs invalides :`, invalidControls);
        invalidControls.forEach(controlName => {
          const control = group.get(controlName);
          console.log(`- Champ "${controlName}" :`, control?.errors);
        });
      } else {
        console.log(`FormGroup à l'index ${index} est valide.`);
      }
    });

    console.log('Formulaire principal valide :', this.form()?.valid);
  }

  private _filter(value: string): Operation[] {
    // console.log(this.operations)
    // console.log('value', this.operations.length, 'test', (this.operations?.length === 0));
    if (this.operations?.length <= 0) return [];
    const filterValue = value.toLowerCase();
    // console.log('filterValue', this.operations);
    return this.operations.filter(option =>
      option.libelle?.toLowerCase().includes(filterValue)
    );
  }

  // private _filterIndex(value: string, index: number): Operation[] {
  //   const filterValue = value.toLowerCase();
  //   const selectedOtherOps = this.operationSelected
  //     .filter(sel => sel.index !== index)
  //     .map(sel => sel.value);

  //   return this.operations
  //     .filter(op =>
  //       op.libelle.toLowerCase().includes(filterValue) &&
  //       !selectedOtherOps.includes(op.id_operation)
  //     );
  // }



  displayOperation = (id: string): string => {
    if (!this.operations) return '';
    const operations = this.operations.find(l => l.id_operation === id);
    return operations ? operations.libelle : '';
  };

  selectOperation(event: MatAutocompleteSelectedEvent, index: number) {
    let value = event.option.value;
    // Supprime l'entrée existante à cet index s'il y en a une
    this.operationSelected = this.operationSelected.filter(sel => sel.index !== index);

    this.operationSelected.push({ index: index, value: value });
    // console.log('ato', this.operationSelected);
    // let operation = this.operations.find(op => op.id_operation === value);
    this.onOperationChange.emit({ id_operation: value, index: index - 1 });
    this.updateFilteredOperations(index);
  }

  updateAllOperation() {
    this.formGroups.forEach((fg, i) => {
      this.updateFilteredOperations(i + 1);
    })
  }

  listControl(index: number): Operation[] {
    // console.log('index', index)
    if (this.operationSelected && !this.verifier) {
      // console.log('select', this.operationSelected);
      const selectedValuesExceptCurrent = this.operationSelected
        .filter(sel => sel.index !== index - 1 && sel.index !== 0)
        .map(sel => sel.value);

      const currentOperation = this.formGroups[index - 1]?.get('operation')?.value;

      const previousOperation = this.formGroups
        .map((fg, i) => fg ? [i, fg.get('operation')?.value] : [])
        .filter(val => val !== null && val !== undefined);

      // console.log('previous ', previousOperation)

      const excluded = previousOperation
        .map((value, idx) => (currentOperation && value[1] && ((value[1]).includes(currentOperation.toString())) ? value[0] : null))
        .filter(idx => idx !== null)

      const operationExclu = this.formGroups.map((fg, i) => excluded.includes(i) ? fg.get('operationAControler')?.value : null)
        .filter((value => value !== null && value !== undefined))

      const operationExcluNonC = this.formGroups.map((fg, i) => excluded.includes(i) ? fg.get('operation')?.value : null)
        .filter((value => value !== null && value !== undefined))

      const allExcluded = Array.from(new Set([...operationExclu, ...operationExcluNonC]));

      const operationNew = this.operations.map((value, ici) => !allExcluded.includes(value.id_operation) ? value : null)
        .filter((value => value !== null && value !== undefined))

      // console.log('exclu ', excluded, 'previous', previousOperation, 'current', currentOperation, 'index', index, ' operation exclu ', operationExclu, 'new operation', operationNew)

      return operationNew;
    } else if (this.operationSelected && this.verifier) {
      return this.operations;
    }
    return [];
  }

  updateFilteredOperations(index: number) {
    this.filteredOperation[index - 1] = this.listControl(index);
    // console.log('operations ', index, this.filteredOperation)
  }

  formatSeuilQualite(index: number): Observable<boolean> {
    const ctrl = this.formGroups.at(index)?.get('seuilQualite');
    let value = ctrl?.value;

    if (value !== null && value !== undefined) {
      value = value.toString().replace(',', '.');
      let num = parseFloat(value);
      if (!isNaN(num)) {
        num = Math.round(num * 100) / 100;
        if (num > 100) {
          alert("La valeur ne peut pas dépasser 100%");
          num = 0;
          return of(false);
        } else if (num < 90 && num > 0) {
          return this.openAlert(index);
        } else if (num < 0) {
          alert("La valeur ne peut pas être négative");
          num = 0;
          return of(false)
        }
        ctrl?.setValue(num);
      }
    }
    return of(true);
  }

  formatCritereRejet(index: number): void {
    const ctrl = this.formGroups.at(index)?.get('critereRejet');
    let value = ctrl?.value;

    if (value !== null && value !== undefined) {
      value = value.toString().replace(',', '.');
      let num = parseFloat(value);
      if (!isNaN(num)) {
        num = Math.round(num * 100) / 100;
        if (num > 100) {
          alert("La valeur ne peut pas dépasser 100");
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



  // drop(event: CdkDragDrop<FormGroup[]>) {
  //   moveItemInArray(this.formArray.controls, event.previousIndex, event.currentIndex);
  // }
  drop(event: CdkDragDrop<FormGroup[]>) {
    if (event.previousIndex === event.currentIndex) return;

    const formArray = this.formArray;
    const item = formArray.at(event.previousIndex);

    formArray.removeAt(event.previousIndex);
    formArray.insert(event.currentIndex, item);
    // console.log(formArray.controls.map(fg => fg.value));
    // this.filteredOperations = this.formGroups.map((fg) =>
    //   fg.get('operation')!.valueChanges.pipe(
    //     startWith(''),
    //     map(value => this._filter(value || ''))
    //   )
    // );
    this.cdref.detectChanges();

  }



  // addItem() {
  //   const fg = this.fb.group({
  //     id: [uuidv4()],
  //     operation: ['', Validators.required],
  //     unite: ['', Validators.required],
  //     seuilQualite: ['', Validators.required],
  //     typeControl: ['', Validators.required],
  //     operationAControler: ['', Validators.required],
  //     critereRejet: ['', Validators.required]
  //   });
  //   const formArray = this.form()?.get('formArray') as FormArray | null;
  //   if (formArray) {
  //     formArray.push(fg);
  //   }
  //   const index = this.formArray.length - 1
  //   this.filteredOperations[index] = fg.get('operation')!.valueChanges.pipe(
  //     startWith(''),
  //     map(value => this._filter(value || ''))
  //   );
  // }

  findDernierOrdre(id: string): any | null {
    const formArray = this.form()?.get('formArray') as FormArray | null;
    if (!formArray) return null;

    const matches = formArray.controls.filter(
      (fg) => (fg as FormGroup).get('operation')?.value === id
    ) as FormGroup[];

    if (matches.length === 0) return 0;

    return matches.length - 1;
  }


  addItem() {

    const fg = this.fb.group({
      id: [uuidv4()],
      id_etape_qualite: [-1],
      operation: ['', Validators.required],
      unite: this.fb.control({ value: '', disabled: true }, Validators.required),
      ordre: [],
      seuilQualite: this.fb.control({ value: '', disabled: true }, [
        Validators.required,
        Validators.pattern(/^\d{1,3}([,.]\d{1,2})?$/),
        Validators.min(0),
        Validators.max(100),
      ]),
      typeControl: this.fb.control({ value: 0, disabled: true }, Validators.required),
      operationAControler: this.fb.control({ value: '', disabled: true }, Validators.required),
      critereRejet: this.fb.control({ value: '', disabled: true }, Validators.required),
    });

    // 🔑 Abonnement dynamique pour activer/désactiver les champs
    fg.get('operation')?.valueChanges.subscribe(value => {
      const controlsToToggle = [
        'seuilQualite',
        'typeControl',
        'operationAControler',
        'critereRejet'
      ];

      let ordreDernier = this.findDernierOrdre((value ?? ''));
      fg.get('ordre')?.setValue(ordreDernier !== null ? ordreDernier : 0);
      controlsToToggle.forEach(ctrlName => {
        const ctrl = fg.get(ctrlName);
        if (!value) {
          ctrl?.disable({ emitEvent: false });
          // ctrl?.reset(); // optionnel : vide le champ
        } else {
          ctrl?.enable({ emitEvent: false });
        }
      });
    });

    // Ajouter le FormGroup au FormArray
    const formArray = this.form()?.get('formArray') as FormArray | null;
    formArray?.push(fg);

    // Si tu utilises filteredOperations comme dans ton addItem initial
    const index = formArray && typeof formArray.length === 'number' ? formArray.length - 1 : 0;
    this.filteredOperations[index] = fg.get('operation')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }


  removeItem(index: number) {
    // const formArray = this.form.get('formArray') as FormArray | null;

    const formArray = this.formArray

    let id_etape_qualite = formArray.at(index)?.get('id_etape_qualite')?.value;
    let name = 'detail_projet.etape_qualite';

    let confirm = false;

    this.detailService.deleteDonne(id_etape_qualite, name).then((value: any) => {
      console.log('donne', value)
      if (formArray) {
        formArray.removeAt(index);
        formArray.updateValueAndValidity();
        this.updateEtape.emit();
        this.cdref.detectChanges();
      }
    }).catch((error) => {
      confirm = false;
      alert(error.message)
    })


  }

  submit() {
    const formArray = this.form()?.get('formArray');
    if (formArray && formArray.invalid) {
      formArray.markAllAsTouched(); // active les messages d’erreur
      // sinon tu récupères les données valides :
      const data = formArray.getRawValue(); // ou .value si tu ne veux pas les champs disabled
      // console.log('Données à envoyer', data);

      // ici : appel API, console, ou autre traitement
      return;
    }

  }

}
