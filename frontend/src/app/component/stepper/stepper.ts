import { Component, inject, Inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { ProjectDetail } from '../project-detail/project-detail';
import { ObjectifQualite } from '../objectif-qualite/objectif-qualite';
import { TypeErreur } from '../type-erreur/type-erreur';
import { ActivatedRoute, Router } from '@angular/router';
import { Ligne } from '../../interface/Ligne';
import { Fonction } from '../../interface/Fonction';
import { Projet } from '../../interface/Projet';
import { DetailProjectService } from '../../service/DetailProjectService';
import { debounceTime, map, merge, Observable, of, startWith } from 'rxjs';
import { VueGlobal } from '../../interface/VueGlobal';
import { FonctionModele } from '../../class/FonctionModele';
import { Operation } from '../../interface/Operation';
import { Operations } from '../../class/Operations';
import { CommonModule } from '@angular/common';
import { Unite } from '../../interface/Unite';
import { TypeTraitement } from '../../interface/TypeTraitement';
import { Erreur } from '../../interface/Erreur';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { FormStorageService } from '../../service/FormStorageService';
import { DetailClient } from "../detail-client/detail-client";
import { v4 as uuidv4 } from 'uuid';
// import { MatDialog } from '@angular/material/dialog';
import { Clonage } from '../clonage/clonage';
import { MatDialog } from '@angular/material/dialog';
import { CacheData } from '../../service/cache-data';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StepperStateService {
  cpResponsable: string = '';
}

@Component({
  selector: 'app-stepper',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    ProjectDetail,
    ObjectifQualite,
    TypeErreur,
    DetailClient
  ],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class Stepper {
  // private detailService = Inject(DetailProjectService);

  form1!: FormGroup;
  formInterlocuteur!: FormGroup;
  form2!: FormGroup;
  form3!: FormGroup;

  colone_form3: string[] = [];
  id_form_colonne: string[] = [];

  items = [''];

  data: any;
  updateData: boolean = false;
  updateErreur: boolean = false;
  // data = {
  //   ligne: [],
  //   fonction: [],
  //   plan: [],
  //   operation: [],
  //   typetraitements: [],
  //   erreurs: [],
  //   verif: [],
  // };

  ligne!: Ligne[];
  fonction!: Fonction[];
  plan!: Projet[];
  typeTraitement!: TypeTraitement[];
  erreurs!: Erreur[];
  operations!: Operation[];
  unites!: Unite[];
  selectedLigne = '';
  filteredOperations!: Observable<Erreur[]>[];
  verification: any;
  existVerif: boolean = false;
  id!: Observable<string>;
  fonctionParam!: Observable<string>;
  client !: string;
  nom_client!: string;
  nom_fonction!: string;
  nom_line!: string;
  defaultLine!: string;
  defaultFonction!: string;
  defaultOperation!: string;
  cachedata = inject(CacheData);
  id_projet!: number;

  allUser = [
    { matricule: 'CP1', pseudo: 'Rakoto' },
    { matricule: 'CP2', pseudo: 'Rasoa' },
    { matricule: 'CP3', pseudo: 'Rabe' },
    { matricule: 'CP4', pseudo: 'Jean' },
    { matricule: 'CP5', pseudo: 'Paul' }
  ];
  initializing = true;

  generated = false;

  async updateValue(event: any) {
    const { id, value, name } = event;
    console.log("Debounced event:", event);
    await this.detailService.updateUnitaire(id, value, name)
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private detailService: DetailProjectService,
    private formSubmitService: FormStorageService,
    private router: Router,
    private stepperState: StepperStateService,
  ) {
    this.id = route.params.pipe(map((p) => p['id']));
    this.fonctionParam = route.params.pipe(map((p) => p['fonction']));
    // this.form1 = this.fb.group({
    //   ligne: ['', Validators.required],
    //   plan: ['', Validators.required],
    //   fonction: ['', Validators.required],
    //   description_traite: ['', Validators.required],
    //   type_traite: ['', Validators.required],
    //   client_nom: ['', Validators.required],
    //   interlocuteur_nom: ['', Validators.required],
    //   contact_interlocuteur: ['', [Validators.required]],
    //   cp_responsable: ['', Validators.required],
    // });
    // this.form2 = this.fb.group({
    //   formArray: this.fb.array(this.items.map(item => this.fb.group({
    //     operation: ['', Validators.required],
    //     unite: ['', Validators.required],
    //     seuilQualite: ['', Validators.required],
    //     typeControl: ['', Validators.required],
    //     operationAControler: ['', Validators.required],
    //     critereRejet: ['', Validators.required]
    //   })
    //   ))
    // });
    this.form3 = this.fb.group({
      formErreur: this.fb.array([]),
    });
  }

  currentStep = 0;

  // openDialog(): void {
  //   const dialogRef = this.dialog.open(Clonage, {
  //     width: '400px', // Par exemple, tu peux définir la largeur
  //     data: { name: 'Utilisateur' } // Tu peux passer des données au modal
  //   });

  //   // Optionnel : s'abonner au résultat après la fermeture du modal
  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('Le modal a été fermé. Résultat : ', result);
  //     // 'result' sera true ou false en fonction du bouton cliqué dans le modal
  //   });
  // }

  onStepChange(event: StepperSelectionEvent) {
    this.currentStep = event.selectedIndex;
    // console.log('currentStep = ', this.currentStep);
  }

  onLigneChange(event: any) {
    let ligne = event.ligne;
    let plan = event.plan;
    this.selectedLigne = ligne;
    let fonction = '';
    let fonctions = this.detailService
      .filtre(ligne, plan, fonction)
      .pipe(
        map((response: VueGlobal[]) => new FonctionModele().cast(response))
      );
    // this.fonction = fonctions;
  }

  // onFunctionChange(event: any) {
  //   let ligne = event.ligne;
  //   let plan = event.plan;
  //   let fonction = event.fonction;
  //   this.operations = this.detailService.filtre(ligne , plan , fonction).pipe(
  //     map((result: VueGlobal[]) => new Operations().cast(result))
  //   )
  // }

  // onFonctionChange(fonction: string) {
  //   this.selectedFonction = fonction;
  // }

  get formGroup3() {
    return (this.form3.controls['formErreur'] as FormArray)
      .controls as FormGroup[];
  }

  updateFiltered3() {
    // console.log('initialiser form 1 avant', this.form1.value, this.verification);
    this.filteredOperations = this.formGroup3.map((fg, i) =>

      fg.get('typeErreur')!.valueChanges.pipe(
        startWith(''),
        map((value) => {
          // console.log('valueChanges déclenché pour ligne', i, 'valeur:', value);
          return this._filter(value || '');
        })
      )
    );
  }

  initData(clone: boolean) {
    // console.log('data ', this.data)
    let data$ = this.cachedata.loadData();
    // console.log("data ", data$);
    // if (data$) {
    //   this.ligne = data$.ligne;
    //   this.plan = data$.plan;
    //   this.fonction = data$.fonction;
    // } else {
    this.allUser = this.data.users.users;
    this.ligne = this.data.ligne;
    this.plan = this.data.plan;
    this.fonction = this.data.fonction;
    // }

    this.typeTraitement = this.data.typetraitements;
    this.erreurs = this.data.erreurs;
    this.operations = this.data.operation;
    this.unites = [];
    this.verification = this.data.verif;
    console.log('verifier', this.verification);
  }

  async initDataupdated(clone: boolean) {
    // console.log('data ', this.data)
    let data$ = this.cachedata.loadData();
    // console.log("data ", data$);
    // if (data$) {
    //   this.ligne = data$.ligne;
    //   this.plan = data$.plan;
    //   this.fonction = data$.fonction;
    // } else {

    this.allUser = this.data.users.users;
    this.ligne = this.data.ligne;
    this.plan = this.data.plan;
    this.fonction = this.data.fonction;
    // }

    this.typeTraitement = await (this.data.typetraitements as Promise<any>);
    this.erreurs = await (this.data.erreurs as Promise<any>);
    this.operations = await (this.data.operation as Promise<any>);

    this.unites = await this.detailService.getUnite();
    this.verification = this.data.verif;
    console.log('verifier', this.verification);
  }

  private lastCpResponsable: string = '';

  async operationChange(value: any) {
    const { id_operation, index } = value;
    let id_act = this.operations.find(op => op.id_operation === id_operation)?.id_type_qte_act || 0;
    let unite: any = await this.detailService.getUniteById(id_act);
    // console.log("Unite change", unite);
    // let uniteSelectioner = this.unites.find(u => u.id_type_qte_act === unite.id_type_qte_act);
    (this.form2.controls['formArray'] as FormArray).at(index)?.get('unite')?.setValue(unite?.id_type_qte_act);
  }

  ngOnInit() {

    this.route.data.subscribe(res => {
      this.data = res['data'];
      this.initData(false);

      // let id = this.route.snapshot.paramMap.get('id') || '';

      this.defaultLine = this.ligne[0]?.id_ligne || '';
      this.defaultFonction = this.fonction[0]?.id_fonction || '';
      let doneInit = { ligne: this.defaultLine, plan: this.plan[0].id_plan, fonction: this.defaultFonction };
      this.initOperation(doneInit);
      this.defaultOperation = this.operations[0]?.id_operation || '';
      let idValue = this.route.snapshot.paramMap.get('id') || '';
      this.client = idValue;
      this.nom_client = this.plan[0].libelle || '';
      this.nom_fonction = this.fonction[0].libelle || '';
      this.nom_line = this.ligne[0].libelle || '';
      if (this.verification) {
        this.updateData = true;
        this.existVerif = true;

        // console.log('client ', this.nom_client);

        let projet_exist = this.verification.projet;
        this.id_projet = projet_exist.id_projet;

        this.form1 = this.fb.group({
          ligne: [this.defaultLine, Validators.required],
          plan: [idValue, Validators.required],
          fonction: [this.defaultFonction, Validators.required],
          description_traite: [projet_exist.description_traitement, Validators.required],
          type_traite: [projet_exist.id_type_traitement, Validators.required],
          client_nom: [''],
          interlocuteur_nom: [projet_exist.nom_interlocuteur],
          contact_interlocuteur: [projet_exist.contact_interlocuteur],
          cp_responsable: [this.stepperState.cpResponsable || projet_exist.id_cp, Validators.required], // <-- injecte la valeur sauvegardée
        });

        let verifInterlocuteur = this.verification.interlocuteurs;
        // console.log('verifInterlocuteur', verifInterlocuteur);
        this.formInterlocuteur = this.fb.group({
          client: this.fb.group({
            nom_client: [{ value: this.nom_client, disabled: true }]
          }),
          interlocuteur: this.fb.array(
            (verifInterlocuteur && verifInterlocuteur.length > 0)
              ? verifInterlocuteur.map((item: any) => {
                const group = this.fb.group({
                  id_interlocuteur: [item.id_interlocuteur], 
                  nom_interlocuteur: [item.nom_interlocuteur, Validators.required],
                  contact_interlocuteur: this.fb.control(
                    { value: item.contact_interlocuteur, disabled: !item.nom_interlocuteur },
                    [Validators.required, Validators.email]
                  )
                });

                // 🔑 Ajout d'une logique dynamique
                group.get('nom_interlocuteur')?.valueChanges.subscribe(value => {
                  const contactCtrl = group.get('contact_interlocuteur');
                  if (!value) {
                    contactCtrl?.disable({ emitEvent: false });
                    // contactCtrl?.reset(); // optionnel, si tu veux vider le champ
                  } else {
                    contactCtrl?.enable({ emitEvent: false });
                  }
                });

                return group;
              })
              : [
                (() => {
                  const group = this.fb.group({
                    id_interlocuteur: [-1],
                    nom_interlocuteur: ['', Validators.required],
                    contact_interlocuteur: this.fb.control(
                      { value: '', disabled: true },
                      [Validators.required, Validators.email]
                    )
                  });

                  // même logique
                  group.get('nom_interlocuteur')?.valueChanges.subscribe(value => {
                    const contactCtrl = group.get('contact_interlocuteur');
                    if (!value) {
                      contactCtrl?.disable({ emitEvent: false });
                      contactCtrl?.reset();
                    } else {
                      contactCtrl?.enable({ emitEvent: false });
                    }
                  });

                  return group;
                })()
              ]
          )
        });



        // Remplir form2 avec les données existantes si elles sont présentes dans verifier
        const formArrayData = this.verification?.etape || [];

        this.form2 = this.fb.group({
          formArray: this.fb.array(
            (formArrayData.length > 0 ? formArrayData : this.items).map((item: any) => {
              const group = this.fb.group({
                id: [item.id || uuidv4()],
                id_etape_qualite: [item.id_etape_qualite || ''],
                operation: [item.operation_de_control?.toString() || '', Validators.required],
                unite: this.fb.control(
                  { value: item.id_unite_de_controle || '', disabled: !item.operation_de_control },
                  Validators.required
                ),
                seuilQualite: this.fb.control(
                  { value: item.seuil_qualite || '', disabled: !item.operation_de_control },
                  [
                    Validators.required,
                    Validators.pattern(/^\d{1,3}([,.]\d{1,2})?$/),
                    Validators.min(0),
                    Validators.max(100),
                  ]
                ),
                typeControl: this.fb.control(
                  { value: item.type_de_controle || '', disabled: !item.operation_de_control },
                  Validators.required
                ),
                operationAControler: this.fb.control(
                  { value: item.operation_a_controller?.toString() || '', disabled: !item.operation_de_control },
                  Validators.required
                ),
                critereRejet: this.fb.control(
                  { value: item.coef_rejet || '', disabled: !item.operation_de_control },
                  Validators.required
                ),
              });

              // 🔑 Abonnement dynamique
              group.get('operation')?.valueChanges.subscribe(value => {
                const controlsToToggle = [
                  'unite',
                  'seuilQualite',
                  'typeControl',
                  'operationAControler',
                  'critereRejet'
                ];
                controlsToToggle.forEach(ctrlName => {
                  const ctrl = group.get(ctrlName);
                  if (!value) {
                    ctrl?.disable({ emitEvent: false });
                    // ctrl?.reset(); // optionnel : vide le champ
                  } else {
                    ctrl?.enable({ emitEvent: false });
                  }
                });
              });

              return group;
            })
          )
        });



        // console.log('form 2 value', this.form2.value);
        this.generate();


        this.initializing = false;
      } else {
        let donne = {
          id: -1,
          value: { id_ligne: this.defaultLine, id_plan: idValue, id_fonction: this.defaultFonction, id_client: idValue },
          name: 'detail_projet.projet:_'
        };


        this.detailService.updateUnitaire(donne.id, donne.value, donne.name).then(() => {

        });

        //   {
        //     id: -1,
        //     value: idValue,
        //     name: 'detail_projet.projet:id_plan'
        //   },
        //   {
        //     id: -1,
        //     value: this.defaultFonction,
        //     name: 'detail_projet.projet:id_fonction'
        //   }
        // ];


        this.form1 = this.fb.group({
          ligne: [this.defaultLine, Validators.required],
          plan: [idValue, Validators.required],
          fonction: [this.defaultFonction, Validators.required],
          description_traite: ['', Validators.required],
          type_traite: ['', Validators.required],
          client_nom: [''],
          interlocuteur_nom: [''],
          contact_interlocuteur: [''],
          cp_responsable: [this.lastCpResponsable, Validators.required], // <-- injecte la valeur sauvegardée
        });

        this.formInterlocuteur = this.fb.group({
          client: this.fb.group({
            nom_client: [this.nom_client]
          }),
          interlocuteur: this.fb.array([
            this.fb.group({
              nom_interlocuteur: ['', Validators.required],
              contact_interlocuteur: ['', [Validators.required, Validators.email]]
            })
          ])
        })

        this.form2 = this.fb.group({
          formArray: this.fb.array(
            this.items.map((item) =>
              this.fb.group({
                id: [uuidv4()],
                id_etape_qualite: [''],
                operation: ['', Validators.required],
                unite: ['', Validators.required],
                seuilQualite: [
                  '',
                  [
                    Validators.required,
                    Validators.pattern(/^\d{1,3}([,]\d{1,2})?$/),
                    Validators.min(0),
                    Validators.max(100),
                  ],
                ],
                typeControl: ['', Validators.required],
                operationAControler: ['', Validators.required],
                critereRejet: ['', Validators.required],
              })
            )
          ),
        });
      }




      // console.log(typeof this.detailService.filtre);
      let status = this.form1.status;
      if (status == 'VALID') {
        const donne = this.form1.value;
        this.initOperation(donne);
      }
      this.form1.statusChanges.subscribe((status) => {

        // console.log('initialiser form 1 subsc', this.form1.value, this.verification);
        if (status === 'VALID') {
          const donne = this.form1.value;
          this.initOperation(donne);
          // this.detailService
          //   .filtre(donne.ligne, donne.plan, donne.fonction)
          //   .subscribe(async (res: VueGlobal[]) => {
          //     this.operations = new Operations().cast(res);

          //     const unite = await this.detailService.getUnite();
          //     // this.detailService.getUnite().subscribe(res => {
          //     this.unites = unite;

          //   });
        }
      });


      this.updateFiltered3();

      this.subscribeToFormChanges();
      // console.log('list ligne', this.ligne, 'list plan ', this.plan, 'list fonction ', this.fonction);
    });
  }

  initOperation(donne: any) {
    this.detailService
      .filtre(donne.ligne, donne.plan, donne.fonction)
      .subscribe(async (res: VueGlobal[]) => {
        this.operations = new Operations().cast(res);

        const unite = await this.detailService.getUnite();
        // this.detailService.getUnite().subscribe(res => {
        this.unites = unite;
      });
  }

  subscribeToFormChanges() {
    // this.formInterlocuteur?.valueChanges.subscribe((value) => {

    // });
  }
  // merge(this.form1.valueChanges, this.formInterlocuteur.valueChanges, this.form2.valueChanges, this.form3?.valueChanges ?? of(null))
  //   .pipe(debounceTime(2000))
  //   .subscribe(async () => {
  //     // console.log('Form changes detected',this.form1.value,this.verification,this.initializing);

  //     if (this.updateData) {
  //       // this.verification = verifier;
  //       this.update();
  //       try {
  //         this.data = await this.detailService.resolveFilterSimple(this.defaultLine, this.client, this.defaultFonction);
  //         await this.initDataupdated(false);
  //         // console.log('data updated', await this.data)
  //       } catch (error) {
  //         // console.log(error);
  //       }
  //       this.updateData = true;
  //       // console.log(data)
  //     } else {
  //       this.insert();
  //       try {
  //         this.data = await this.detailService.resolveFilterSimple(this.defaultLine, this.client, this.defaultFonction);
  //         await this.initDataupdated(false);
  //         // console.log('data updated', this.data)
  //       } catch (error) {
  //         // console.log(error);
  //       }
  //       this.updateData = true;
  //     }
  //   });
  // }


  private _filter(value: string): Erreur[] {
    // console.log('erreur ', this.erreurs);
    if (this.erreurs?.length <= 0) return [];
    const filterValue = value.toLowerCase();
    return this.erreurs.filter((option) =>
      option.type_erreur?.toLowerCase().includes(filterValue)
    );
  }

  generate() {
    const formArray = this.form2.get('formArray') as FormArray;
    const values = formArray.value;
    this.colone_form3 = values.map((item: any) => item.operation);
    // console.log('colonne form 3 verif', this.colone_form3);
    const colonneForm = this.operations
      .map((operation: Operation) =>
        operation && this.colone_form3.includes(operation.id_operation)
          ? operation.libelle
          : null
      )
      .filter((ind) => ind !== null && ind !== undefined);

    this.id_form_colonne = this.operations
      .map((operation: Operation) =>
        operation && this.colone_form3.includes(operation.id_operation)
          ? operation.id_operation
          : null
      )
      .filter((ind) => ind !== null && ind !== undefined);


    // this.id_form_colonne = this.operations.map((operation: Operation) => (operation && this.colone_form3.includes(operation.id_operation)) ? operation.id_operation : null).filter(ind => ind !== null && ind !== undefined);

    this.colone_form3 = colonneForm;

    if (this.verification) {
      let update = 1;
      if (this.verification.erreur) this.updateErreur = true;
      for (const erreur of this.verification.erreur) {
        this.ajouterLigne(this.colone_form3, erreur, update);
      }
      this.generated = true;
      this.updateFiltered3();
    }


    // console.log('colonne form', this.colone_form3);
    // console.log('form 3 value', this.form3.value);
    // console.log( 'colonne', colonneForm, 'values', values, 'colonneForm', this.colone_form3 );

    let formulaire3 = this.form3.controls['formErreur'] as FormArray;
    this.removeEmptyTypeErreurGroups();
    // console.log('formulauire ', formulaire3, this.verification, (!formulaire3 || formulaire3.length === 0) || !this.verification)
    if ((!formulaire3 || formulaire3.length === 0) || !this.verification) {
      this.ajouterLigne(colonneForm, '', 0);
    }

    this.updateFiltered3();
    // console.log('initialiser form 1 apres', this.form1.value, this.verification);
    // console.log('form 3 value', this.form3.controls);
    // this.detailService.filtre('ligne1', 'plan1', 'fonction1').subscribe((resultats: Operations[]) => {
    //   console.log('resultats', resultats);
    //   this.operations = resultats;
    // });
  }

  // filtre() {
  //   let donne = this.form1.value;
  //   this.detailService.filtre(donne.ligne,donne.plan,donne.fonction).subscribe((resultats: Operations[]) => {
  //     console.log('resultats', resultats);
  //     this.operations = resultats;
  //   });
  //   // console.log('form 1',this.form1.value)
  // }

  get typeErreur() {
    return this.form3.get('formErreur') as FormArray;
  }

  remplirFormArray() {
    this.colone_form3.forEach((item) => {
      this.typeErreur.push(this.fb);
    });
  }

  genererGroup(colonne: string[] = [], value: any, update: number): FormGroup | null {
    let unique: boolean = false;
    let group: { [key: string]: any } = {};
    if (value) {

      let verfierErreur = this.verifierTypeErreur(value.libelle_erreur);
      if (!verfierErreur) {
        group = {
          typeErreur: ['', Validators.required],
          degre: ['', Validators.required],
          coef: ['', Validators.required],
          raccourci: ['', Validators.required],
        };

        group['typeErreur'] = [value.libelle_erreur || '', Validators.required];
        group['degre'] = [value.est_majeur ? 1 : 0, Validators.required];
        group['coef'] = [value.coef || 0, Validators.required];
        group['raccourci'] = [value.raccourci || '', Validators.required];

        if (this.id_form_colonne) {
          const colonneNonVide = colonne.filter(
            (res) => res != '' && res != null && res != undefined
          );
          if (colonneNonVide.length === 1) {
            unique = true;
          }

          for (const [index, id_colone] of this.id_form_colonne.entries()) {
            if (id_colone === value.operation_de_control.toString() && this.verification?.erreur.some((obj: any) => obj.operation_de_control)) {
              group[colonne[index]] = [value.valable];
            }
          }
        }

      } else {
        if (this.id_form_colonne) {
          for (const [index, id_colone] of this.id_form_colonne.entries()) {
           if (id_colone === value.operation_de_control.toString()) {         if (!(verfierErreur as FormGroup).contains(colonne[index])) {
                (verfierErreur as FormGroup).addControl(colonne[index], this.fb.control(value.valable));
              } else {
                (verfierErreur as FormGroup).get(colonne[index])?.setValue(value.valable);
              }
            }
          }
        }
      }
    } else if (!value && update == 0) {
      group = {
        typeErreur: ['', Validators.required],
        degre: ['', Validators.required],
        coef: ['', Validators.required],
        raccourci: ['', Validators.required],
      };
      colonne.forEach((col) => {
        group[col] = [''];
      });
    }
    // else {
    //   colonne.forEach((col) => {
    //     group[col] = [''];
    //   });

    // }


    // Only return a FormGroup if group is not null or empty
    if (group && Object.keys(group).length > 0) {
      return this.fb.group(group);
    }
    return null;
  }

  ajouterLigne(colonne: string[] = [], value: any, update: number) {
    // console.log('ajouter ligne', colonne)
    let group = this.genererGroup(colonne, value, update);
    if (group) {

      const colonneNonVide = colonne.filter(
        (res) => res != '' && res != null && res != undefined
      );

      // console.log('Collonne  non vide : ', colonneNonVide);
      if (!this.updateErreur) {
        for (const col of colonneNonVide) {
          // console.log("Restauration value ", col);
          group.get(col)?.setValue(false);
        }

        if (colonneNonVide.length === 1 && !value) {
          const col = colonneNonVide[0];
          group.get(col)?.setValue(true);
        }
      }
      return this.typeErreur.push(group);
    } else {
      return null
    }

  }

  verifierTypeErreur(name: string) {
    const formArray = this.typeErreur;
    const control = formArray.controls.find((ctrl) => ctrl.get('typeErreur')?.value === name);
    return control;
  }

  substractLigne(event: number) {
    this.typeErreur.removeAt(event);
  }

  addLigne() {
    let before = this.updateData;
    this.updateErreur = false;
    this.ajouterLigne(this.colone_form3, '', 0);
    this.updateErreur = before;
    this.updateFiltered3();
  }

  removeEmptyTypeErreurGroups() {
    const formArray = this.form3.get('formErreur') as FormArray;
    // Parcours à l'envers pour éviter les problèmes d'index lors de la suppression
    for (let i = formArray.length - 1; i >= 0; i--) {
      const group = formArray.at(i) as FormGroup;
      const typeErreurValue = group.get('typeErreur')?.value;
      if (!typeErreurValue || typeErreurValue.trim() === '') {
        formArray.removeAt(i);
      }
    }
  }

  updateFinal() {
    if (this.verification) {
      const data = {
        ...this.form1.value,
        ...this.form2.value,
        ...this.form3.value,
        colonne: this.colone_form3,
        id_colonnes: this.id_form_colonne,
        clientDetail: this.formInterlocuteur.value,
        id_projet: this.verification.projet.id_projet
      };
      // console.log('Formulaire complet :', data, 'colonne ', this.colone_form3, 'id', this.id_form_colonne);
      this.formSubmitService.updateParametre(data).then((response) => {
        // console.log('Réponse du serveur :', response);
      }).catch((error) => {
        console.error('Erreur lors de l\'envoi des données :', error);
      });
      this.router.navigate(['/Dashboard/parametrage']);
      // this.router.navigate(['/Dashboard/parametrage'], { state: { data: data } });
    }
  }

  async update() {
    // Sauvegarde la valeur avant update
    if (this.form1 && this.form1.get('cp_responsable')) {
      this.stepperState.cpResponsable = this.form1.get('cp_responsable')?.value || '';
    }
    if (this.verification) {
      const data = {
        ...this.form1.value,
        ...this.form2.value,
        ...this.form3.value,
        colonne: this.colone_form3,
        id_colonnes: this.id_form_colonne,
        clientDetail: this.formInterlocuteur.value,
        id_projet: this.verification.projet.id_projet
      };
      // console.log('update debounce Formulaire complet :', data, 'colonne ', this.colone_form3, 'id', this.id_form_colonne);
      this.formSubmitService.updateParametre(data).then((response) => {
        // console.log('Réponse du serveur :', response);
      }).catch((error) => {
        console.error('Erreur lors de l\'envoi des données :', error);
      });
    }
  }

  insert() {
    const data = {
      ...this.form1.value,
      ...this.form2.value,
      ...this.form3.value,
      colonne: this.colone_form3,
      clientDetail: this.formInterlocuteur.value,
      id_colonnes: this.id_form_colonne
    };
    // console.log('Inserer Formulaire complet :', data, 'colonne ', this.colone_form3, 'id', this.id_form_colonne);
    this.formSubmitService.parametrage(data).then((response) => {
      // console.log('Réponse du serveur :', response);
    }).catch((error) => {
      console.error('Erreur lors de l\'envoi des données :', error);
    });
  }

  submit() {
    const data = {
      ...this.form1.value,
      ...this.form2.value,
      ...this.form3.value,
      clientDetail: this.formInterlocuteur.value,
      colonne: this.colone_form3,
      id_colonnes: this.id_form_colonne
    };
    // console.log('Formulaire complet :', data, 'colonne ', this.colone_form3, 'id', this.id_form_colonne);
    this.formSubmitService.parametrage(data).then((response) => {
      // console.log('Réponse du serveur :', response);
    }).catch((error) => {
      console.error('Erreur lors de l\'envoi des données :', error);
    });
    this.router.navigate(['/Dashboard/recap'], { state: { data: data } });
  }
}
