import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Ligne } from '../../interface/Ligne';
import { Fonction } from '../../interface/Fonction';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { filter, fromEvent, map, Observable, startWith, Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { Projet } from '../../interface/Projet';
import { Erreur } from '../../interface/Erreur';
import { TypeTraitement } from '../../interface/TypeTraitement';
import { MatIconModule } from '@angular/material/icon';

import { COMMA, ENTER } from '@angular/cdk/keycodes';

export interface Contact {
  matricule: string;
  pseudo: string;
}
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
    MatInputModule,
    MatChipsModule,
    MatIconModule
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
  @Output() onFunctionChange = new EventEmitter<{ ligne: string, plan: string, fonction: string }>();

  formulaire !: FormGroup;

  contactCtrl = new FormControl();

  // Observable for the filtered list
  filteredContacts!: Observable<any>;

  // List of selected contacts that will be displayed as chips
  selectedContacts: any = [];

  // All available contacts for filtering
  // allContacts: any = [
  //   { matricule: 'CP1', pseudo: 'Rakoto' },
  //   { matricule: 'CP2', pseudo: 'Rasoa' },
  //   { matricule: 'CP3', pseudo: 'Rabe' },
  //   { matricule: 'CP4', pseudo: 'Jean' },
  //   { matricule: 'CP5', pseudo: 'Paul' }
  // ];

  allContacts = input<any>([
    { matricule: 'CP1', pseudo: 'Rakoto' },
    { matricule: 'CP2', pseudo: 'Rasoa' },
    { matricule: 'CP3', pseudo: 'Rabe' },
    { matricule: 'CP4', pseudo: 'Jean' },
    { matricule: 'CP5', pseudo: 'Paul' }
  ]);

  separatorKeysCodes: number[] = [ENTER, COMMA];
  @ViewChild('contactInput') contactInput!: ElementRef<HTMLInputElement>;

  // Référence à l'instance de la directive MatAutocompleteTrigger sur cet input
  @ViewChild('contactInput', { read: MatAutocompleteTrigger }) autocompleteTrigger!: MatAutocompleteTrigger;

  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  private subscription!: Subscription;

  constructor(private builder: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.isStepper = false;


  }

  /** Adds a chip when the user presses Enter or adds a comma. */
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    console.log('Adding contact:', this.allContacts());
    const contact = this.allContacts().find((c: any) => c.matricule.toLowerCase() === value.toLowerCase());
    console.log('Found contact:', contact, "entrer", value);
    // Check if the contact exists and is not already in the selectedContacts array
    if (contact && !this.selectedContacts.some((c: any) => c.matricule === contact.matricule)) {
      this.selectedContacts.push(contact);
    }

    // Clear the input value
    if (event.input) {
      event.input.value = '';
    }
    this.contactCtrl.setValue(null);
    this.updateFormGroupValue();
  }

  /** Removes a chip when the user clicks the 'cancel' icon. */
  remove(contact: any): void {
    // Use findIndex() to find the index based on a unique property, like 'matricule'
    const index = this.selectedContacts.findIndex((c: any) => c.matricule === contact.matricule);

    if (index >= 0) {
      this.selectedContacts.splice(index, 1);
    }
    this.updateFormGroupValue();
  }

  /** Adds a chip when the user selects an option from the autocomplete list. */
  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedContact = event.option.value;
    console.log("select ", selectedContact);
    // Check if the contact is not already selected using a unique property
    if (!this.selectedContacts.some((c: any) => c.matricule === selectedContact.matricule)) {
      console.log("Select options", selectedContact);
      this.selectedContacts.push(selectedContact);
    }

    // Clear the input and reset the form control
    if (this.contactInput) {
      this.contactInput.nativeElement.value = '';
    }
    this.contactCtrl.setValue(null);
    this.updateFormGroupValue();
  }
  private updateFormGroupValue(): void {
    // Join the 'value' of each selected contact into a comma-separated string
    const selectedValues = this.selectedContacts.map((c: any) => c.matricule).join(',');
    // Update the value of the 'cp_responsable' form control
    this.form().get('cp_responsable')?.setValue(selectedValues);
  }

  /** Filters the list of available contacts based on the user's input. */
  private _filterCp(value: string | Contact): Contact[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.matricule.toLowerCase();
    return this.allContacts().filter((contact: { matricule: string; }) => contact.matricule.toLowerCase().includes(filterValue));
  }

  checkDonne() {
    console.log(this.fonction());
  }

  ngOnInit() {

    console.log('Adding contact:', this.allContacts());
    // this.contactCtrl = this.form().get('cp_responsable');
    this.filteredContacts = this.contactCtrl.valueChanges.pipe(
      startWith(null),
      map((contact: string | null) => (contact ? this._filterCp(contact) : this.allContacts().slice()))
    );

    const initialValue = this.form().get('cp_responsable')?.value;
    console.log("intial user", this.allContacts());
    // 2. Check if the value exists and is not empty
    if (initialValue) {
      // 3. Split the comma-separated string into an array of values
      const valueArray = initialValue.split(',');

      // 4. Find the matching contact objects and add them to the selectedContacts array
      valueArray.forEach((val: any) => {
        const foundContact = this.allContacts().find((c: any) => c.matricule === val);
        if (foundContact) {
          // Prevent duplicates in case the initial value has them
          if (!this.selectedContacts.some((c: any) => c.matricule === foundContact.matricule)) {
            this.selectedContacts.push(foundContact);
          }
        }
      });

      // 5. Update the form control to reflect the new state
      this.updateFormGroupValue();
    }
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

  ngAfterViewInit() {
    this.handleTabAsEnter();
  }
  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
  handleTabAsEnter() {
    this.subscription = fromEvent(this.contactInput.nativeElement, 'keydown')
      .pipe(
        filter((event: Event) =>
          (event as KeyboardEvent).key === 'Tab' && this.autocompleteTrigger.panelOpen
        )
      )
      .subscribe((event: Event) => {
        event.preventDefault();
        const selectedOption = this.matAutocomplete.options.first;
        if (selectedOption) {
          const selectionEvent: MatAutocompleteSelectedEvent = {
            option: selectedOption,
            source: this.matAutocomplete
          };
          this.matAutocomplete.optionSelected.emit(selectionEvent);
        }
      });
  }
   onTab(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    console.log("tabulation in event");
    // Si le panneau est ouvert, on “transforme” Tab en sélection
    // if (this.autocompleteTrigger?.panelOpen || this.matAutocomplete.isOpen) {
      keyboardEvent.preventDefault();

      // On essaie d'abord de prendre l’option active (celle survolée)
      const active: any =
        (this.autocompleteTrigger as any).activeOption
        || this.matAutocomplete.options?.first;

      if (active) {
        // Émet l’événement de sélection comme si l’utilisateur avait pressé Enter
        const fakeEvent: MatAutocompleteSelectedEvent = {
          option: active,
          source: this.matAutocomplete
        } as MatAutocompleteSelectedEvent;

        this.matAutocomplete.optionSelected.emit(fakeEvent);

        // Optionnel : referme le panneau proprement
        this.autocompleteTrigger.closePanel();
      // }
    }
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

      console.log('Formulaire valide, envoi des données :', this.form().value);
      return;
    }

    // Si tout est valide, tu peux envoyer les données
    console.log('Formulaire valide, envoi des données :', this.form().value);
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
