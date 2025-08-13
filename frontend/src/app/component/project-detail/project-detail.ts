import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Ligne } from '../../interface/Ligne';
import { Fonction } from '../../interface/Fonction';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { map, Observable, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Projet } from '../../interface/Projet';
import { Erreur } from '../../interface/Erreur';
import { TypeTraitement } from '../../interface/TypeTraitement';

@Component({
  selector: 'app-project-detail',
  imports: [
    FontAwesomeModule,
    RouterModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    CommonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css'
})
export class ProjectDetail {
  etape = 1;

  id !: string;

  filteredOptions !: Observable<Fonction[]>;

  filteredOptionsLigne !: Observable<Ligne[]>;

  readonly form = input.required<FormGroup>();

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isStepper: boolean;

  readonly ligne = input<Ligne[]>([]);

  readonly fonction = input<Fonction[]>([]);

  readonly plan = input.required<Projet[]>();

  readonly typeTraitement = input.required<TypeTraitement[]>();

  @Output() ligneChange = new EventEmitter<{ ligne: string, plan: string }>();
  @Output() onFunctionChange = new EventEmitter<{ ligne: string, plan: string , fonction: string}>();


  formulaire !: FormGroup;

  constructor(private builder: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.isStepper = false;
  }

  checkDonne() {
    console.log(this.fonction());
  }

  ngOnInit() {

    // this.id = this.route.snapshot.paramMap.get('id') || "";
    // console.log('List dans le formulaire', this.ligne);
    // let defaultLine = this.ligne[0]?.id_ligne || '';
    // let defaultFonction = this.fonction[0]?.id_fonction || '';
    // this.form = this.builder.group({
    //   ligne: [defaultLine, Validators.required],
    //   plan: [this.id, Validators.required],
    //   fonction: [defaultFonction, Validators.required],
    //   description_traite: ['', Validators.required],
    //   type_traite: ['', Validators.required],
    //   client_nom: ['', Validators.required],
    //   interlocuteur_nom: ['', Validators.required],
    //   contact_interlocuteur: ['', [Validators.required, Validators.email]],
    //   cp_responsable: ['', Validators.required],
    // });




    // this.formulaire = this.builder.group({
    //   ligne: [defaultLine, Validators.required],
    //   plan: [this.id, Validators.required],
    //   fonction: [defaultFonction, Validators.required],
    //   description_traite: ['', Validators.required],
    //   type_traite: ['', Validators.required],
    //   client_nom: ['', Validators.required],
    //   interlocuteur_nom: ['', Validators.required],
    //   contact_interlocuteur: ['', [Validators.required, Validators.email]],
    //   cp_responsable: ['', Validators.required],
    // });

    // console.log('Formulaire initialized with plan:', this.id, ' and ligne:', this.ligne[0]);

    this.filteredOptions = this.form().get('fonction')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );

    this.filteredOptionsLigne = this.form().get('ligne')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterLigne(value || ''))
    );
  }
  private _filter(value: string): Fonction[] {
    // console.log('value', this.fonction.length, 'test', (this.fonction?.length === 0));
    const fonction = this.fonction();
    if (fonction?.length <= 0) return [];
    const filterValue = value.toLowerCase();
    // console.log('filterValue', this.fonction);
    return fonction.filter(option =>
      option.libelle?.toLowerCase().includes(filterValue)
    );
  }

  private _filterLigne(value: string): Ligne[] {
    // console.log('value', this.ligne.length, 'test', (this.ligne?.length === 0));
    const ligne = this.ligne();
    if (ligne?.length <= 0) return [];
    const filterValue = value.toLowerCase();
    // console.log('filterValue', this.ligne);
    return ligne.filter(option =>
      option.libelle?.toLowerCase().includes(filterValue)
    );
  }


  displayLigne = (id: string): string => {
    const ligneValue = this.ligne();
    if (!ligneValue) return '';
    const ligne = ligneValue.find(l => l.id_ligne === id);
    return ligne ? ligne.libelle : '';
  };



  displayFonction = (id: string): string => {
    const fonctionValue = this.fonction();
    if (!fonctionValue) return '';
    const fonction = fonctionValue.find(f => f.id_fonction === id);
    return fonction ? fonction.libelle : '';
  };



  onLigneChange(event: any) {
    const selectedLigne = event.option.value;
    const plan = this.route.snapshot.paramMap.get('id') || '';
    this.ligneChange.emit({ ligne: selectedLigne, plan: plan });
  }
  
  functionChange(event: any) {
    const selectedLigne = event.option.value;
    const plan = this.route.snapshot.paramMap.get('id') || '';
    console.log(this.form().value)
    // this.onFunctionChange.emit({ ligne: selectedLigne, plan: plan });
  }


  suivant() {
    // console.log('Form submitted:', this.form.value);
    this.router.navigate(['objectif'], { relativeTo: this.route });
    // console.log('Navigating to project detail');
  }

  checkFormBeforeSubmit(): void {
    const form = this.form();
    if (form.invalid) {
      this.markFormGroupTouched(form);
      this.checkFormValidationErrors(form);
      return;
    }

    // Si tout est valide, tu peux envoyer les données
    // console.log('Formulaire valide, envoi des données :', this.form.value);
  }
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  private checkFormValidationErrors(form: FormGroup): void {
    Object.keys(form.controls).forEach(field => {
      const control = form.get(field);
      if (control && control.invalid) {
        const errors = control.errors;
        // console.warn(`Erreur dans le champ "${field}" :`);
        if (errors?.['required']) {
          // console.warn('  - Ce champ est requis.');
        }
        if (errors?.['email']) {
          // console.warn('  - Format d\'email invalide.');
        }
      }
    });
  }



}
