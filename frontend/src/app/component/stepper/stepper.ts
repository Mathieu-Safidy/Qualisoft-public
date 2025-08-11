import { Component, Inject } from '@angular/core';
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
import { map, Observable, startWith } from 'rxjs';
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
  ],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class Stepper {
  // private detailService = Inject(DetailProjectService);

  form1!: FormGroup;
  form2!: FormGroup;
  form3!: FormGroup;

  colone_form3: string[] = [];
  id_form_colonne: string[] = [];

  items = [''];

  data: any;

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

  // selectedPlan = '';
  selectedLigne = '';
  filteredOperations!: Observable<Erreur[]>[];

  verification: any;
  // selectedFonction = '';
  existVerif: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private detailService: DetailProjectService,
    private formSubmitService: FormStorageService,
    private router: Router
  ) {
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

  onStepChange(event: StepperSelectionEvent) {
    this.currentStep = event.selectedIndex;
    console.log('currentStep = ', this.currentStep);
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
    this.filteredOperations = this.formGroup3.map((fg, i) =>
      fg.get('typeErreur')!.valueChanges.pipe(
        startWith(''),
        map((value) => {
          console.log('valueChanges déclenché pour ligne', i, 'valeur:', value);
          return this._filter(value || '');
        })
      )
    );
  }

  ngOnInit() {
    this.data = this.route.snapshot.data['data'];
    console.log('data ', this.data)
    this.ligne = this.data.ligne;
    this.plan = this.data.plan;
    this.fonction = this.data.fonction;
    this.typeTraitement = this.data.typetraitements;
    this.erreurs = this.data.erreurs;
    this.operations = this.data.operation;
    this.unites = [];

    this.updateFiltered3();

    // console.log('resolver: ', this.ligne, this.plan, this.fonction, this.data.operation);

    let id = this.route.snapshot.paramMap.get('id') || '';
    let defaultLine = this.ligne[0]?.id_ligne || '';
    let defaultFonction = this.fonction[0]?.id_fonction || '';
    let defaultOperation = this.operations[0]?.id_operation || '';

    let verifier: any = this.data.verif;
    console.log('verifier', verifier)
    if (verifier) {
      this.existVerif = true;
      this.verification = verifier;
      let nom_client = this.data.client.nom;

      console.log('client ', nom_client)

      let projet_exist = verifier.projet;
      this.form1 = this.fb.group({
        ligne: [defaultLine, Validators.required],
        plan: [id, Validators.required],
        fonction: [defaultFonction, Validators.required],
        description_traite: [projet_exist.description_traitement, Validators.required],
        type_traite: [projet_exist.id_type_traitement, Validators.required],
        client_nom: [nom_client, Validators.required],
        interlocuteur_nom: [projet_exist.nom_interlocuteur, Validators.required],
        contact_interlocuteur: [projet_exist.contact_interlocuteur, [Validators.required, Validators.email]],
        cp_responsable: [projet_exist.id_cp, Validators.required],
      });

      // Remplir form2 avec les données existantes si elles sont présentes dans verifier
      const formArrayData = verifier?.etape || [];

      this.form2 = this.fb.group({
        formArray: this.fb.array(
          formArrayData.length > 0
            ? formArrayData.map((item: any) =>
              this.fb.group({
                id: [item.id || crypto.randomUUID()],
                id_etape_qualite: [item.id_etape_qualite || ''],
                operation: [item.operation_de_control.toString() || '', Validators.required],
                unite: [item.id_unite_de_controle || '', Validators.required],
                seuilQualite: [
                  item.seuil_qualite || '',
                  [
                    Validators.required,
                    Validators.pattern(/^\d{1,3}([,.]\d{1,2})?$/),
                    Validators.min(0),
                    Validators.max(100),
                  ],
                ],
                typeControl: [item.type_de_controle || 0, Validators.required],
                operationAControler: [item.operation_a_controller.toString() || '', Validators.required],
                critereRejet: [item.coef_rejet || '', Validators.required],
              })
            )
            : this.items.map((item) =>
              this.fb.group({
                id: [crypto.randomUUID()],
                id_etape_qualite: [''],
                operation: ['', Validators.required],
                unite: ['', Validators.required],
                seuilQualite: [
                  '',
                  [
                    Validators.required,
                    Validators.pattern(/^\d{1,3}([,.]\d{1,2})?$/),
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

      for (const erreur of verifier.erreur) {
        this.ajouterLigne(this.colone_form3, erreur);
      }
      this.updateFiltered3();

      console.log('form 2 value', this.form2.value)
      console.log('form 3 value', this.form3.value)

    } else {

      this.form1 = this.fb.group({
        ligne: [defaultLine, Validators.required],
        plan: [id, Validators.required],
        fonction: [defaultFonction, Validators.required],
        description_traite: ['', Validators.required],
        type_traite: ['', Validators.required],
        client_nom: ['', Validators.required],
        interlocuteur_nom: ['', Validators.required],
        contact_interlocuteur: ['', [Validators.required, Validators.email]],
        cp_responsable: ['', Validators.required],
      });

      this.form2 = this.fb.group({
        formArray: this.fb.array(
          this.items.map((item) =>
            this.fb.group({
              id: [crypto.randomUUID()],
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
    // this.form2 = this.fb.group({
    //   formArray: this.fb.array(
    //     this.items.map((item) =>
    //       this.fb.group({
    //         id: [crypto.randomUUID()],
    //         id_etape_qualite: [''],
    //         operation: ['', Validators.required],
    //         unite: ['', Validators.required],
    //         seuilQualite: [
    //           '',
    //           [
    //             Validators.required,
    //             Validators.pattern(/^\d{1,3}([,]\d{1,2})?$/),
    //             Validators.min(0),
    //             Validators.max(100),
    //           ],
    //         ],
    //         typeControl: ['', Validators.required],
    //         operationAControler: ['', Validators.required],
    //         critereRejet: ['', Validators.required],
    //       })
    //     )
    //   ),
    // });



    console.log(typeof this.detailService.filtre);
    let status = this.form1.status;
    if (status == 'VALID') {
      const donne = this.form1.value;
      this.detailService
        .filtre(donne.ligne, donne.plan, donne.fonction)
        .subscribe(async (res: VueGlobal[]) => {
          this.operations = new Operations().cast(res);

          const unite = await this.detailService.getUnite();
          // this.detailService.getUnite().subscribe(res => {
          this.unites = unite;

          // let defaultOperation = this.operations[0]?.id_operation || '';
          // let defaultUnite = this.unites[0]?.id_type_qte_act || '';
          // this.form2 = this.fb.group({
          //   formArray: this.fb.array(
          //     this.items.map((item) =>
          //       this.fb.group({
          //         id: [crypto.randomUUID()],
          //         operation: ['', Validators.required],
          //         unite: ['', Validators.required],
          //         seuilQualite: [
          //           '',
          //           [
          //             Validators.required,
          //             Validators.pattern(/^\d{1,3}([,]\d{1,2})?$/),
          //             Validators.min(0),
          //             Validators.max(100),
          //           ],
          //         ],
          //         typeControl: ['', Validators.required],
          //         operationAControler: ['', Validators.required],
          //         critereRejet: ['', Validators.required],
          //       })
          //     )
          //   ),
          // });
          // })
        });
    }
    this.form1.statusChanges.subscribe((status) => {
      if (status === 'VALID') {
        const donne = this.form1.value;
        this.detailService
          .filtre(donne.ligne, donne.plan, donne.fonction)
          .subscribe(async (res: VueGlobal[]) => {
            this.operations = new Operations().cast(res);

            const unite = await this.detailService.getUnite();
            // this.detailService.getUnite().subscribe(res => {
            this.unites = unite;

            let defaultOperation = this.operations[0]?.id_operation || '';
            let defaultUnite = this.unites[0]?.id_type_qte_act || '';
            this.form2 = this.fb.group({
              formArray: this.fb.array(
                this.items.map((item) =>
                  this.fb.group({
                    id: [crypto.randomUUID()],
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
            // })
          });
      }
    });
    // console.log('list ligne', this.ligne, 'list plan ', this.plan, 'list fonction ', this.fonction);
  }

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
    console.log(
      'colonne',
      colonneForm,
      'values',
      values,
      'colonneForm',
      this.colone_form3
    );

    let formulaire3 = this.form3.controls['formErreur'] as FormArray;
    if (!formulaire3 || formulaire3.length === 0) {
      this.ajouterLigne(colonneForm, '');
    }

    this.updateFiltered3();

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

  genererGroup(colonne: string[] = [], value: any): FormGroup {
    const group: { [key: string]: any } = {
      typeErreur: ['', Validators.required],
      degre: ['', Validators.required],
      coef: ['', Validators.required],
      raccourci: ['', Validators.required],
    };
    if (value) {
      group['typeErreur'] = [value.libelle_erreur || '', Validators.required];
      group['degre'] = [value.est_majeur ? 1 : 0, Validators.required];
      group['coef'] = [value.coef || 0, Validators.required];
      group['raccourci'] = [value.raccourci || '', Validators.required];

      if (this.id_form_colonne) {
        colonne.forEach((col, index) => {
          if (this.id_form_colonne[index] == value.operation_de_control) {
            group[col] = [value.valable];
          }
        });
      }

    } else {
      colonne.forEach((col) => {
        group[col] = [''];
      });

    }


    return this.fb.group(group);
  }

  ajouterLigne(colonne: string[] = [], value: any) {
    // console.log('ajouter ligne', colonne)
    let group = this.genererGroup(colonne, value);

    const colonneNonVide = colonne.filter(
      (res) => res != '' && res != null && res != undefined
    );

    if (colonneNonVide.length === 1 && !value) {
      const col = colonneNonVide[0];
      group.get(col)?.setValue(true);
    }


    return this.typeErreur.push(group);
  }

  substractLigne(event: number) {
    this.typeErreur.removeAt(event);
  }

  addLigne() {
    this.ajouterLigne(this.colone_form3, '');
    this.updateFiltered3();
  }

  update() {
    if (this.verification) {

      const data = {
        ...this.form1.value,
        ...this.form2.value,
        ...this.form3.value,
        colonne: this.colone_form3,
        id_colonnes: this.id_form_colonne,
        id_projet: this.verification.id_projet
      };
    }
  }

  submit() {
    const data = {
      ...this.form1.value,
      ...this.form2.value,
      ...this.form3.value,
      colonne: this.colone_form3,
      id_colonnes: this.id_form_colonne
    };
    console.log('Formulaire complet :', data, 'colonne ', this.colone_form3, 'id', this.id_form_colonne);
    this.formSubmitService.parametrage(data).then((response) => {
      console.log('Réponse du serveur :', response);
    }).catch((error) => {
      console.error('Erreur lors de l\'envoi des données :', error);
    });
    this.router.navigate(['/Dashboard/recap'], { state: { data: data } });
  }
}
