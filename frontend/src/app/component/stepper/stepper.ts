import { ChangeDetectorRef, Component, inject, Inject, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { ProjectDetail } from '../project-detail/project-detail';
import { ObjectifQualite } from '../objectif-qualite/objectif-qualite';
import { TypeErreur } from '../type-erreur/type-erreur';
import { ActivatedRoute, Router } from '@angular/router';
import { Ligne } from '../../interface/Ligne';
import { Fonction } from '../../interface/Fonction';
import { Projet } from '../../interface/Projet';
import { DetailProjectService } from '../../service/DetailProjectService';
import { BehaviorSubject, debounceTime, firstValueFrom, map, merge, Observable, of, startWith } from 'rxjs';
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
import { BcqParameter } from "../bcq-parameter/bcq-parameter";
import { ExterneParameter } from "../externe-parameter/externe-parameter";

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
    DetailClient,
    BcqParameter,
    ExterneParameter
  ],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class Stepper {
  // private detailService = Inject(DetailProjectService);
  @ViewChild('stepper') stepper!: MatStepper;
  form1!: FormGroup;
  formInterlocuteur!: FormGroup;
  form2!: FormGroup;
  form3!: FormGroup;
  bcqForm!: FormGroup;
  externeForm!: FormGroup;

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
  colonne: Observable<string[]>[] = [];
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
  isBcqControle: boolean = false;
  isExterneControl: boolean = false;
  colonneObserver: BehaviorSubject<{ name: string, id: string | number }[]> = new BehaviorSubject<{ name: string, id: string | number }[]>([]);
  // coloneEtape = this.colonneObserver.asObservable();

  cdr = inject(ChangeDetectorRef)


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

  addColonne(colonne: string, id: string | number, form: FormArray ,value?: any) {
    let actuel = this.colonneObserver.value;
    this.colonneObserver.next([...actuel, { name: colonne, id: id }]);
    this.addEtapeArray(colonne, form, value);
  }

  // addDonne(donne: {name: string, id: any}[], form: FormArray) { 

  // }

  deleteColone(nom: string, form: FormArray) {
    let actuel = this.colonneObserver.value;
    this.colonneObserver.next(actuel.filter(c => c.name !== nom));
    this.deleteEtapeArray(nom, form);
  }

  addEtapeGroup(name: string, form: FormGroup, value?: any) {
    if (value != null && value != undefined && typeof value === 'boolean') {
      form.addControl(name, this.fb.control(value));
    } else {
      form.addControl(name, this.fb.control(value || ''));
    }
  }

  addEtapeArray(name: string, formArray: FormArray ,value?: any) {
    // const formArray = this.form2.get('formArray') as FormArray;
    formArray.controls.forEach((fg) => {
      if (!(fg as FormGroup).contains(name)) {
        // (fg as FormGroup).addControl(name, this.fb.control([value || '']));
        this.addEtapeGroup(name, fg as FormGroup, value);
      }
    })
  }

  deleteEtapeArray(name: string, form: FormArray) {
    // const formArray = this.form2.get('formArray') as FormArray;
    console.log('deleteEtapeArray', name, form);
    
    form.controls.forEach((fg) => {
      if (fg instanceof FormGroup && fg.contains(name)) {
        fg.removeControl(name);
      }
    });
  }

  onStepChange(event: StepperSelectionEvent) {
    // this.currentStep = event.selectedIndex;
    // console.log('currentStep = ', this.currentStep);
    let selectedIndex = event.selectedIndex;
    const isLastStep = selectedIndex === this.stepper.steps.length - 1;
    console.log('step ', selectedIndex);

    // Si on arrive à l'avant-dernière étape (juste avant la dernière), on peut lancer la génération.
    // L'index de l'étape "Type d'erreur" est (total steps - 1)
    if (isLastStep) {
      console.log('last step reached');

      // La génération ne se fait que si elle n'a pas encore été faite
      if (!this.generated) {
        // this.generate(); 
        console.log('generate called from step change', this.form3.value);

        this.generated = true;
      }
    } else {
      this.generated = false; // Réinitialiser si on n'est pas à la dernière étape
    }
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
    this.cdr.detectChanges();
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

  findDernierOrdre(id: string): any | null {
    const formArray = this.form2.get('formArray') as FormArray | null;
    if (!formArray) return null;

    const matches = formArray.controls.filter(
      (fg) => (fg as FormGroup).get('operation')?.value === id
    ) as FormGroup[];

    if (matches.length === 0) return 0;

    return matches.length - 1;
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


      this.bcqForm = this.fb.group({
        consigne: this.fb.group({
          id_param_bcq: [-1],
          validite: ['', Validators.required],
          structure: ['', Validators.required],
          exhaustivite: ['', Validators.required],
        }),
        stockage: this.fb.array([])
      });

      this.externeForm = this.fb.group({
        indexation: this.fb.array([])
      });



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

        let bcqTypeControle = formArrayData.some((fa: any) => fa.type_de_controle === 1);
        let externeTypeCtrl = formArrayData.some((fa: any) => fa.type_de_controle === 2);
        console.log("bcqTypeControle", bcqTypeControle, formArrayData);
        if (bcqTypeControle) {
          this.isBcqControle = true;
        }
        if (externeTypeCtrl) {
          this.isExterneControl = true;
        }

        this.form2 = this.fb.group({
          formArray: this.fb.array(
            (formArrayData.length > 0 ? formArrayData : this.items).map((item: any) => {
              console.log('id etapes  == ', item.id_etape_qualite);

              const group = this.fb.group({
                id: [item.id || uuidv4()],
                id_etape_qualite: [item.id_etape_qualite || ''],
                operation: [item.operation_de_control?.toString() || '', Validators.required],
                ordre: [item.ordre || 0],
                unite: this.fb.control(
                  { value: item.id_unite_de_controle || '', disabled: true },
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
                  { value: (item.type_de_controle != null && item.type_de_controle != undefined) ? item.type_de_controle : 0, disabled: !item.operation_de_control },
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
                let ordreDernier = this.findDernierOrdre(value);
                group.get('ordre')?.setValue(ordreDernier !== null ? ordreDernier : 0);
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

        console.log('donne form objectf ', this.form2.value);



        this.bcqForm.patchValue({
          consigne: {
            id_param_bcq: this.verification.bcq_donnees[0]?.id_param_bcq || -1,
            validite: this.verification.bcq_donnees[0]?.validite || '',
            structure: this.verification.bcq_donnees[0]?.structure || '',
            exhaustivite: this.verification.bcq_donnees[0]?.exhaustivite || '',
          }
        })

        if (this.verification.info_bcq && this.verification.info_bcq.length > 0) {
          this.verification.info_bcq.forEach((info: any) => {
            this.addStockage(info.libelle, info.valeur, info.id_info_bcq);
          })
        } else {
          this.addStockage();
        }

        if (this.verification.param_externe && this.verification.param_externe.length > 0) {
          console.log("param_externe insertion", this.verification.param_externe);
          this.verification.param_externe.forEach((info: any) => {
            this.addIndexation(info.libelle, info.onglet || '', info.colonne || '', info.id_param_externe, info.id_champ_param_interne);
          })
          console.log("Valeur initiale externeForm après patch:", this.externeForm.controls);
        }


        console.log("Valeur initiale bcqForm:", this.bcqForm.value, this.verification.bcq_donnees[0]);

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
          formArray: this.items.map(item => {
            const group = this.fb.group({
              id: [uuidv4()],
              id_etape_qualite: [''],
              operation: ['', Validators.required],
              unite: [{ value: '', disabled: true }, Validators.required],
              seuilQualite: [{ value: '', disabled: true }, [
                Validators.required,
                Validators.pattern(/^\d{1,3}([,]\d{1,2})?$/),
                Validators.min(0),
                Validators.max(100)
              ]],
              typeControl: [{ value: '', disabled: true }, Validators.required],
              operationAControler: [{ value: '', disabled: true }, Validators.required],
              critereRejet: [{ value: '', disabled: true }, Validators.required],
            });

            group.get('operation')?.valueChanges.subscribe(value => {
              const controls = ['unite', 'seuilQualite', 'typeControl', 'operationAControler', 'critereRejet'];
              controls.forEach(ctrlName => {
                const ctrl = group.get(ctrlName);
                if (!value) {
                  ctrl?.disable({ emitEvent: false });
                } else {
                  ctrl?.enable({ emitEvent: false });
                }
              });
            });

            return group;
          })
        });





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


        this.addStockage();


        this.updateFiltered3();

        this.subscribeToFormChanges();
        // console.log('list ligne', this.ligne, 'list plan ', this.plan, 'list fonction ', this.fonction);
      }
      this.verfierTypeControl();
    });
  }

  /**
 * Getter pratique pour accéder facilement au stockage
 */
  get stockage(): FormArray {
    return this.bcqForm.get('stockage') as FormArray;
  }

  addErreur({ id_erreur, type_erreur }: { id_erreur: number; type_erreur: string }) {
    this.erreurs.push({ id_erreur, type_erreur, coef: 0, id_gravite: 0 });
  }

  /**
   * Ajoute un item dans stockage
   */
  addStockage(libelle: string = '', emplacement: string = '', id: number | string = -1) {
    const group = this.fb.group({
      id_info_bcq: [id],
      libelle: [libelle, Validators.required],
      emplacement: this.fb.control(
        { value: emplacement, disabled: !libelle }, // désactivé si libelle vide
        Validators.required
      )
    });

    // 🔑 Abonnement dynamique : si libelle change, on active/désactive emplacement
    group.get('libelle')?.valueChanges.subscribe(value => {
      const emplacementCtrl = group.get('emplacement');
      if (!value) {
        emplacementCtrl?.disable({ emitEvent: false });
        emplacementCtrl?.reset('', { emitEvent: false });
      } else {
        emplacementCtrl?.enable({ emitEvent: false });
      }
    });

    this.stockage.push(group);
  }
  addIndexation(libelle: string = '', onglet: string = '', colonne: string = '', id: number | string = -1, id_champ_param_interne: string | number = -1) {
    const group = this.fb.group({
      id_param_externe: [id],
      id_champ_param_interne: [id_champ_param_interne],
      libelle: [libelle, Validators.required],
      onglet: [{ value: onglet, disabled: !libelle }, Validators.required],
      colonne: [{ value: colonne, disabled: !libelle }, Validators.required]
    });

    // 🔑 Abonnement dynamique : si libelle change, on active/désactive onglet et colonne
    group.get('libelle')?.valueChanges.subscribe(value => {
      const ongletCtrl = group.get('onglet');
      const colonneCtrl = group.get('colonne');
      if (!value) {
        ongletCtrl?.disable({ emitEvent: false });
        colonneCtrl?.disable({ emitEvent: false });
      } else {
        ongletCtrl?.enable({ emitEvent: false });
        colonneCtrl?.enable({ emitEvent: false });
      }
    });

    (this.externeForm.get('indexation') as FormArray).push(group);
  }

  deleteStockage(index: number) {
    let id = (this.stockage.at(index) as FormGroup)?.get('id_info_bcq')?.value || -1;
    let name = 'detail_projet.info_bcq';
    this.detailService.deleteDonne(id, name)
      .then((donne) => {
        console.log("Donnée supprimée :", donne);
        this.stockage.removeAt(index);
        this.cdr.detectChanges();
      })
      .catch((res: any) => {
        alert('Erreur lors de la suppression : ' + res.message);
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

  verfierTypeControl() {
    this.form2.valueChanges.pipe(debounceTime(500)).subscribe(value => {
      let formArray = value.formArray;
      let bcq = formArray.some((fa: any) => parseInt(fa.typeControl) === 1);
      let externe = formArray.some((fa: any) => parseInt(fa.typeControl) === 2);
      console.log("verification type de pcontrol ", formArray, 'condition', bcq);
      if (this.isBcqControle !== bcq) {
        this.isBcqControle = bcq;
        this.cdr.detectChanges();
      }
      if (this.isExterneControl !== externe) {
        this.isExterneControl = externe;
        this.cdr.detectChanges();
      }
    })
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

  // updateColonne() {
  //   const formArray = this.form2.get('formArray') as FormArray;
  //     const values = formArray.value;
  //     this.colone_form3 = values.map((item: any) => item.operation);
  //     console.log('operations ', this.operations);

  //     const colonneForm = this.operations
  //       .map((operation: Operation) =>
  //         operation && this.colone_form3.includes(operation.id_operation)
  //           ? operation.libelle
  //           : null
  //       )
  //       .filter((ind) => ind !== null && ind !== undefined);

  //       firstValueFrom(this.colonneObserver.asObservable()).then(col => {
  //         let colone_form3_old = col.map(c => c.name);
  //         let new_colonne = colonneForm.filter(c => !colone_form3_old.includes(c));
  //         let removed_colonne = colone_form3_old.filter(c => !colonneForm.includes(c));
  //         console.log('new_colonne', new_colonne, 'removed_colonne', removed_colonne);

  //         removed_colonne.forEach(c => {
  //           this.deleteColone(c);
  //         });

  //         new_colonne.forEach((c) => {
  //           this.addColonne(c, this.operations.find(op => op.libelle === c)?.id_operation || -1 , false);
  //         });



  //       });



  // }
  updateColonne() {
    const formArray = this.form2.get('formArray') as FormArray;
    const formErreur = this.form3.get('formErreur') as FormArray;
    const values = formArray.value;
    const colone_form3 = values.map((item: any) => item.operation);

    const colonneForm = this.operations
      .filter(op => colone_form3.includes(op.id_operation))
      .map(op => op.libelle);

    const colCurrent = this.colonneObserver.getValue();
    const colCurrentNames = colCurrent.map(c => c.name);

    const new_colonne = colonneForm.filter(c => !colCurrentNames.includes(c));
    const removed_colonne = colCurrentNames.filter(c => !colonneForm.includes(c));

    // Supprime les colonnes
    removed_colonne.forEach(c => this.deleteColone(c,formErreur));

    // Ajoute les nouvelles colonnes
    const nouvellesColonnes = new_colonne.map(c => {
      const op = this.operations.find(op => op.libelle === c);
      return { name: c, id: op?.id_operation || -1 };
    });

    console.log('value', values,'new_colonne', new_colonne, 'removed_colonne', removed_colonne, 'nouvellesColonnes', nouvellesColonnes, 'colnne', colone_form3 , 'colcurrent', colCurrentNames ,'colonneform', colonneForm, 'current', colCurrent);


    if (nouvellesColonnes.length) {
      this.colonneObserver.next([...colCurrent.filter(c => !removed_colonne.includes(c.name)), ...nouvellesColonnes]);
      nouvellesColonnes.forEach(c => {
        if (!c.name) return;
        // if (formArray.controls)
        // if (this.checkKeysInFormGroup())
        this.addEtapeArray(c.name, formErreur, false);
        console.log('Ajout de la colonne :', c.name);
        
      });
    }

    // formArray.controls.forEach((fg) => {
    //   if (fg instanceof FormGroup) {
        
    //   }
    // })

  }



  async generate() {
    try {

      const formArray = this.form2.get('formArray') as FormArray;
      const values = formArray.value;
      this.colone_form3 = values.map((item: any) => item.operation);
      console.log('operations ', this.operations);

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

      this.colone_form3 = colonneForm;

      this.colonneObserver.next(this.id_form_colonne.map((id, index) => ({ name: colonneForm[index], id: id })));
      this.cdr.detectChanges();
      console.log('colonne generer',this.colonneObserver.getValue());

      let colonneFormu = this.colonneObserver.getValue().map(c => c.name);

      if (!this.colonneObserver.getValue()) {
        return;
      }
      if (this.verification) {
        console.log('colonne a generer',this.colonneObserver.getValue(), this.id_form_colonne);
        let update = 1;
        if (this.verification.erreur) this.updateErreur = true;
        for (const erreur of this.verification.erreur) {
          this.ajouterLigne(colonneFormu, erreur, update);
          this.cdr.detectChanges();
        }
        this.updateFiltered3();
      }
      let formulaire3 = this.form3.controls['formErreur'] as FormArray;
      this.removeEmptyTypeErreurGroups();
      // Ajoute une ligne vide si aucune erreur n'existe ou si la vérification ne contient pas d'erreur
      if (!this.verification?.erreur && this.verification.erreur.length === 0) {
        console.log('Ajouter une ligne vide', formulaire3, this.verification);

        this.ajouterLigne(colonneFormu, '', 0);
        this.cdr.detectChanges();
      }
      console.log('type erreur', this.typeErreur);

      this.updateFiltered3();
      return true;
    } catch (error) {
      console.log('Erreur lors de la génération :', error);
      return false;
    }
  }

  chargement() {
    return this.checkKeysInFormGroup(this.typeErreur.at(0) as FormGroup, this.colone_form3);
  }

  checkKeysInFormGroup(formGroup: FormGroup, keys: string[]): boolean {
    // Check if the formGroup is valid and has controls.
    if (!formGroup || !formGroup.controls) {
      return false;
    }

    // Use the every() method to ensure all keys meet the condition.
    return keys.every(key => {
      // The get() method returns null if the control does not exist.
      return formGroup.get(key) !== null;
    });
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

  // genererGroup(colonne: string[] = [], value: any, update: number): FormGroup | null {
  //   let unique: boolean = false;
  //   let group: { [key: string]: any } = {};
  //   if (value) {

  //     let verfierErreur = this.verifierTypeErreur(value.libelle_erreur);
  //     if (!verfierErreur) {
  //       group = {
  //         typeErreur: ['', Validators.required],
  //         degre: ['', Validators.required],
  //         coef: ['', Validators.required],
  //         raccourci: ['', Validators.required],
  //       };

  //       group['typeErreur'] = [value.libelle_erreur || '', Validators.required];
  //       group['degre'] = [value.est_majeur ? 1 : 0, Validators.required];
  //       group['coef'] = [value.coef || 0, Validators.required];
  //       group['raccourci'] = [value.raccourci || '', Validators.required];

  //       if (this.id_form_colonne) {
  //         const colonneNonVide = colonne.filter(
  //           (res) => res != '' && res != null && res != undefined
  //         );
  //         if (colonneNonVide.length === 1) {
  //           unique = true;
  //         }

  //         for (const [index, id_colone] of this.id_form_colonne.entries()) {
  //           if (id_colone === value.operation_de_control.toString() && this.verification?.erreur.some((obj: any) => obj.operation_de_control)) {
  //             group[colonne[index]] = [value.valable];
  //           }
  //         }
  //       }

  //     } else {
  //       if (this.id_form_colonne) {
  //         for (const [index, id_colone] of this.id_form_colonne.entries()) {
  //          if (id_colone === value.operation_de_control.toString()) {         if (!(verfierErreur as FormGroup).contains(colonne[index])) {
  //               (verfierErreur as FormGroup).addControl(colonne[index], this.fb.control(value.valable));
  //             } else {
  //               (verfierErreur as FormGroup).get(colonne[index])?.setValue(value.valable);
  //             }
  //           }
  //         }
  //       }
  //     }
  //   } else if (!value && update == 0) {
  //     group = {
  //       typeErreur: ['', Validators.required],
  //       degre: ['', Validators.required],
  //       coef: ['', Validators.required],
  //       raccourci: ['', Validators.required],
  //     };
  //     colonne.forEach((col) => {
  //       group[col] = [''];
  //     });
  //   }
  //   // else {
  //   //   colonne.forEach((col) => {
  //   //     group[col] = [''];
  //   //   });

  //   // }


  //   // Only return a FormGroup if group is not null or empty
  //   if (group && Object.keys(group).length > 0) {
  //     return this.fb.group(group);
  //   }
  //   return null;
  // }

  async genererGroup(
    colonne: string[] = [],
    value: any,
    update: number
  ): Promise<FormGroup | null> {
    console.log("genererGroup...", colonne, value, update);

    const col = await firstValueFrom(this.colonneObserver.asObservable());
    let fg: FormGroup | null = null;

    if (value) {
      console.log('value', value);

      const err = this.verifierTypeErreur(value.libelle_erreur);
      console.log('erreur verifier', err, this.typeErreur.value);

      if (!err) {
        console.log("generer 1...");

        fg = this.fb.group({
          idErreur: [value.id_type_erreur || -1],
          typeErreur: [value.libelle_erreur || '', Validators.required],
          degre: [value.est_majeur ? 1 : 0, Validators.required],
          coef: [value.coef || 0, Validators.required],
          raccourci: [value.raccourci || '', Validators.required],
        });

        col.forEach(c => {
          const valueCol = c.id === value.operation_de_control ? value.valable : false;
          this.addEtapeGroup(c.name, fg!, valueCol);
        });

      } else {
        // si déjà existant : on met à jour
        col.forEach(c => {
          if (c.id === value.operation_de_control) {
            const fgErr = err as FormGroup;
            console.log("generer 3...", fgErr, c.name, value.valable);
            if (fgErr.get(c.name)) {
              fgErr.get(c.name)?.setValue(value.valable);
            } else {
              this.addEtapeGroup(c.name, fgErr, value.valable);
            }
            fg = fgErr; // on réutilise le groupe existant
          }
        });
      }

    } else if (!value && update === 0) {
      fg = this.fb.group({
        idErreur: [-1],
        typeErreur: ['', Validators.required],
        degre: ['', Validators.required],
        coef: ['', Validators.required],
        raccourci: ['', Validators.required],
      });

      col.forEach(c => {
        this.addEtapeGroup(c.name, fg!, false);
      });
    }

    if (!fg) return null;

    // toggle activation/désactivation
    const toggle = (enable: boolean) =>
      Object.keys(fg!.controls).forEach(
        (k) => k !== 'typeErreur' &&
          (enable
            ? fg!.get(k)?.enable({ emitEvent: false })
            : fg!.get(k)?.disable({ emitEvent: false }))
      );

    toggle(!!fg.get('typeErreur')?.value);

    fg.get('typeErreur')?.valueChanges.subscribe((v) => toggle(!!v));

    return fg;
  }

  // async genererGroup(colonne: string[] = [], value: any, update: number): Promise<FormGroup | null> {
  //   let group: any = {};
  //   console.log("genererGroup...", colonne, value, update);

  //   const col = await firstValueFrom(this.coloneEtape);
  //   if (value) {
  //     const err = this.verifierTypeErreur(value.libelle_erreur);
  //     console.log('erreur veirifier', err);

  //     if (!err) {
  //       console.log("generer 1...");

  //       group = this.fb.group({
  //         idErreur: [value.id_type_erreur || -1],
  //         typeErreur: [value.libelle_erreur || '', Validators.required],
  //         degre: [value.est_majeur ? 1 : 0, Validators.required],
  //         coef: [value.coef || 0, Validators.required],
  //         raccourci: [value.raccourci || '', Validators.required],
  //       });

  //       // let name_etape = col.find(c => c.id === value.operation_de_control)?.id;

  //       col.forEach(c => {
  //         let valueCol = false;
  //         if (c.id === value.operation_de_control) {
  //           valueCol = value.valable;
  //         }
  //         this.addEtapeGroup(c.name, group, valueCol);
  //       });
  //     } else {
  //       // this.id_form_colonne?.forEach((id, i) => {
  //       //   if (id === value.operation_de_control.toString()) {
  //       //     const fg = err as FormGroup;
  //       //     console.log("generer 2...", fg, colonne[i], value.valable);

  //       //     fg.contains(colonne[i]) ? fg.get(colonne[i])?.setValue(value.valable) : fg.addControl(colonne[i],
  //       //       this.fb.control(value.valable));
  //       //   }
  //       // });
  //       col.forEach(c => {
  //         if (c.id === value.operation_de_control) {
  //           const fg = err as FormGroup;
  //           fg.get(c.name) ? fg.get(c.name)?.setValue(value.valable) : this.addEtapeGroup(c.name, fg, value.valable);
  //         }
  //       })
  //     }
  //   } else if (!value && update === 0) {
  //     group = this.fb.group({
  //       idErreur: [-1],
  //       typeErreur: ['', Validators.required],
  //       degre: ['', Validators.required],
  //       coef: ['', Validators.required],
  //       raccourci: ['', Validators.required],
  //       // ...Object.fromEntries(colonne.map((c) => [c, ['']])),
  //     });

  //     col.forEach(c => {
  //         let valueCol = false;
  //         this.addEtapeGroup(c.name, group, valueCol);
  //     });
  //   }

  //   if (!Object.keys(group).length) return null;

  //   const fg = this.fb.group(group);
  //   const toggle = (enable: boolean) =>
  //     Object.keys(fg.controls).forEach(
  //       (k) => k !== 'typeErreur' && (enable ? fg.get(k)?.enable({ emitEvent: false }) : fg.get(k)?.disable({ emitEvent: false }))
  //     );

  //   toggle(!!fg.get('typeErreur')?.value);
  //   fg.get('typeErreur')?.valueChanges.subscribe((v) => toggle(!!v));

  //   return fg;
  // }


  // async ajouterLigne(colonne: string[] = [], value: any, update: number) {
  //   let group = await this.genererGroup(colonne, value, update);

  //   if (group) {
  //     console.log('ajouter ligne', colonne, group)

  //     const colonneNonVide = colonne.filter(
  //       (res) => res != '' && res != null && res != undefined
  //     );

  //     // console.log('Collonne  non vide : ', colonneNonVide);
  //     if (!this.updateErreur) {
  //       for (const col of colonneNonVide) {
  //         group.get(col)?.setValue(false);
  //         console.log("Restauration value ", col, group);
  //       }

  //       if (colonneNonVide.length === 1 && !value) {
  //         const col = colonneNonVide[0];
  //         group.get(col)?.setValue(true);
  //       }
  //     }
  //     console.log('waiting...');

  //     this.typeErreur.push(group);
  //     return;
  //   } else {
  //     return null
  //   }

  // }

  async ajouterLigne(colonne: string[] = [], value: any, update: number) {
    const group = await this.genererGroup(colonne, value, update);
    console.log('groups generer', group);

    if (!group) return null;

    const colonneNonVide = colonne.filter(c => c != '' && c != null && c != undefined);
    let existIndex = this.typeErreur.controls.findIndex(ctrl =>
      // ctrl.get('idErreur')?.value === group.get('idErreur')?.value &&
      ctrl.get('typeErreur')?.value === group.get('typeErreur')?.value
    );
    if (existIndex === -1) {
      this.typeErreur.push(group);
    }
    // Vérifier si le FormGroup existe déjà dans typeErreur
    existIndex = this.typeErreur.controls.findIndex(ctrl =>
      // ctrl.get('idErreur')?.value === group.get('idErreur')?.value &&
      ctrl.get('typeErreur')?.value === group.get('typeErreur')?.value
    );

    console.log('existIndex', existIndex, this.typeErreur.value, value ,' colonne', this.colonneObserver.getValue());


    if (existIndex !== -1) {
      // FormGroup existant → juste patcher les valeurs nécessaires
      const fgExist = this.typeErreur.at(existIndex);
      // colonneNonVide.forEach(col => {
      //   fgExist.get(col)?.setValue(group.get(col)?.value);
      // });

      const col = await firstValueFrom(this.colonneObserver.asObservable());
      col.forEach(c => {
        if (c.id === value.operation_de_control) {
          const fgErr = fgExist as FormGroup;
          console.log("generer 3...", fgErr, c.name, value.valable);
          if (fgErr.get(c.name)) {
            fgErr.get(c.name)?.setValue(value.valable);
          } else {
            this.addEtapeGroup(c.name, fgErr, value.valable);
          }
        }
      });
      return;
    }

    // Sinon → initialisation classique
    if (!this.updateErreur) {
      for (const col of colonneNonVide) {
        group.get(col)?.setValue(false);
      }

      if (colonneNonVide.length === 1 && !value) {
        const col = colonneNonVide[0];
        group.get(col)?.setValue(true);
      }
    }

    // Ajout seulement si pas existant
    return;
  }


  verifierTypeErreur(name: string) {
    const formArray = this.typeErreur;
    const control = formArray.controls.find((ctrl) => ctrl.get('typeErreur')?.value === name);
    return control;
  }

  substractLigne(event: number) {
    this.typeErreur.removeAt(event);
  }

  annuler(value: { form: FormGroup, controlName: string, ancienValue: any }) {
    value.form.get(value.controlName)?.setValue(value.ancienValue, { emitEvent: false });
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
        this.cdr.detectChanges();
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

  ficheQualite() {
    const cp_responsable = (this.form1.get('cp_responsable')?.value || '').split(',').map((v: string) => v.trim());
    const contact = this.allUser.filter(u => cp_responsable.includes(u.matricule));
    console.log('cp_responsable', cp_responsable, 'contact', contact);
    const data = {
      ...this.form1.value,
      ...(this.form2.getRawValue()),
      ...this.form3.value,
      ...this.formInterlocuteur.value,
      contact: contact ?? [],
      colonne: this.colone_form3,
      id_colonnes: this.id_form_colonne,
      fonction: this.fonction[0]
    };
    console.log('form envoyer data', data);

    this.router.navigate(['/Dashboard/recap'], { state: { data: data } });
  }
}
