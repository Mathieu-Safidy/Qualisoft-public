import { Component, inject, Inject, input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { combineLatest, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CacheData } from '../../service/cache-data';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../service/ProjectService';
import { DetailProjectService } from '../../service/DetailProjectService';
import { VueGlobal } from '../../interface/VueGlobal';
import { ProjetModele } from '../../class/ProjetModele';
import { FonctionModele } from '../../class/FonctionModele';
import { LigneModel } from '../../class/LigneModel';
import { Fonction } from '../../interface/Fonction';
import { Projet } from '../../interface/Projet';
import { Ligne } from '../../interface/Ligne';
@Component({
  selector: 'app-clonage',
  imports: [
    MatDialogModule, // Ajout du module de dialogue
    MatButtonModule,
    MatTooltipModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CommonModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './clonage.html',
  styleUrl: './clonage.css'
})
export class Clonage {
  constructor(public dialogRef: MatDialogRef<Clonage>, @Inject(MAT_DIALOG_DATA) public data: any, private router: Router,
    private route: ActivatedRoute) {
  }
  projetService = inject(ProjectService);
  detailService = inject(DetailProjectService);
  destinationForm!: FormGroup;
  cacheData = inject(CacheData);
  // lignes: string[] = ['Ligne 101', 'Ligne 102', 'Ligne 103'];
  // plans: string[] = ['Plan A', 'Plan B', 'Plan C']; // NOUVEAU
  // fonctions: string[] = ['Fonction A', 'Fonction B', 'Fonction C'];
  sourceLigne !: LigneModel | null;
  lignes: Ligne[] = [];
  plans: Projet[] = [];
  fonctions: Fonction[] = [];

  filteredLignes$!: Observable<LigneModel[]>;
  filteredPlans$!: Observable<ProjetModele[]>;
  filteredFonctions$!: Observable<FonctionModele[]>;

  private allLignes$!: Observable<Ligne[]>;
  private allPlans$!: Observable<Projet[]>;
  private allFonctions$!: Observable<Fonction[]>;

  ngOnInit() {
    this.destinationForm = new FormGroup({
      ligne: new FormControl(''),
      plan: new FormControl(''), // NOUVEAU
      fonction: new FormControl('')
    });

    this.initLigne();
    this.onLineChange();
    this.onProjectChange();
    // this.filtrerLigne();
    // this.filtrerPlan();
    // this.filterFonction();

    this.getLigne(this.data.source.planId, this.data.source.fonctionId).subscribe((ligne: LigneModel | null) => {
      this.sourceLigne = ligne;
    });
    // NOUVEAU : Observer les changements de valeur du champ 'plan'
    

   
  }

  displayLine(ligne: LigneModel) {
    return ligne ? `${ligne.libelle}(${ligne.id_ligne})` : '';
  }
  displayPlan(plan: ProjetModele) {
    return plan ? `${plan.libelle}(${plan.id_plan})` : '';
  }
  displayFonction(fonction: FonctionModele) {
    return fonction ? `${fonction.libelle}(${fonction.id_fonction})` : '';
  }

  initLigne() {
    this.allLignes$ = this.detailService.filtre('', '', '')
      .pipe(
        map((response: VueGlobal[]) => new LigneModel().cast(response)),
        // The tap operator is useful for side effects, like saving the data to a property
        tap(lignes => this.lignes = lignes) 
      );
    
    // Combine the API stream with the form control's value changes
    this.filteredLignes$ = combineLatest([
      this.allLignes$,
      this.destinationForm.get('ligne')!.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([lignes, value]) => {
        const filteredLibelles = this._filter(lignes.map((obj: any) => obj.libelle), value);
        return lignes.filter((ligne: any) => filteredLibelles.includes(ligne.libelle));
      })
    );
  }

  // filtrerLigne() {
  //   this.filteredLignes$ = this.destinationForm.get('ligne')!.valueChanges.pipe(
  //     startWith(''),
  //     map(value => { console.log(this.lignes) ;return this._filter(this.lignes.map(ligne => ligne.libelle), value || '')}),
  //     map((ids: string[]) => {
  //       // Ici, vous pouvez effectuer des opérations supplémentaires avec les IDs filtrés
  //       console.log("Id init ",ids)
  //       return this.lignes.filter(ligne => ids.includes(ligne.id_ligne));
  //     })
  //   );
  // }

  filtrerPlan() {
    this.filteredPlans$ = this.destinationForm.get('plan')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.plans.map(plan => plan.libelle), value || '')),
      map((ids: string[]) => {
        // Ici, vous pouvez effectuer des opérations supplémentaires avec les IDs filtrés
        return this.plans.filter(plan => ids.includes(plan.id_plan));
      })
    );
  }

  filterFonction() {
     this.filteredFonctions$ = this.destinationForm.get('fonction')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.fonctions.map(fonction => fonction.libelle), value || '')),
      map((ids: string[]) => {
        // Ici, vous pouvez effectuer des opérations supplémentaires avec les IDs filtrés
        return this.fonctions.filter(fonction => ids.includes(fonction.id_fonction));
      })
    );
  }

  getLigne(plan: string, fonction: string) {
    return this.detailService
      .filtre('', plan, fonction)
      .pipe(
        map((response: VueGlobal[]) => {
          const lignes = new LigneModel().cast(response);
          if (lignes.length > 0) {
            return lignes[0];
          } else {
            return null;
          }
        })
      );
  }

  private _filter(options: string[], value: string): string[] {
    const filterValue = value.toLowerCase();
    // console.log("Filtrer ",options)
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }


  onClose(): void {
    // La méthode close() ferme le modal. Vous pouvez aussi lui passer une valeur.
    this.dialogRef.close();
  }

  onConfirm(): void {
    // On ferme le modal et on renvoie 'true' au composant appelant.

    let value = { destination: { ...this.destinationForm.value } };
    // console.log('data cloning ', value,this.destinationForm.value);
    this.cacheData.setData(value);
    const duplicationError: any = this.projetService.duplicateProjetErreur(
      {
        ligne: this.sourceLigne?.id_ligne || this.data.source.ligneId,
        plan: this.data.source.planId,
        fonction: this.data.source.fonctionId
      },
      {
        ligne: (this.destinationForm.get('ligne')!.value).id_ligne,
        plan: (this.destinationForm.get('plan')!.value).id_plan,
        fonction: (this.destinationForm.get('fonction')!.value).id_fonction
      }
    )

    duplicationError.then((response: any) => {
      // console.log('Response from duplicationError:', response);
      if (response.status === 200) {
        // console.log('Success! Status is 200 OK.');
        // console.log(response);
        alert('Duplication réussie !');
        return response.json();
      } else {
        // console.log(response);
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    })
      .then((data: any) => {
        // alert(data.message);
        this.dialogRef.close(true);
        let plan = this.destinationForm.get('plan')!.value;
        let fonction = this.destinationForm.get('fonction')!.value;
        this.router.navigate(['/Dashboard/parametrage/projet', plan, fonction]);
      })
      .catch((error: any) => {
        alert(error.message);
        this.dialogRef.close(true);
        this.router.navigate(['/Dashboard/parametrage']);
      });
  }

  onLineChange() {
    console.log("line changing ",this.destinationForm.get('ligne'))
    this.filteredPlans$ = this.destinationForm.get('ligne')!.valueChanges.pipe(
      startWith(''),
      switchMap(ligneValue => {
        if (!ligneValue) {
          return of([]); // Return an empty array if no line is selected
        }
        return this.detailService.filtre(ligneValue.id_ligne, '', '').pipe(
          map((response: VueGlobal[]) => new ProjetModele().cast(response)),
          tap(plans => this.plans = plans)
        );
      }),
      // Combine with plan form control changes to filter
      switchMap(plans => {
        return this.destinationForm.get('plan')!.valueChanges.pipe(
          startWith(''),
          map(planValue => {
            const filteredLibelles = this._filter(plans.map((obj:any) => obj.libelle), planValue);
            return plans.filter((plan: any) => filteredLibelles.includes(plan.libelle));
          })
        );
      })
    );
  }

  onProjectChange() {
    this.filteredFonctions$ = combineLatest([
      this.destinationForm.get('ligne')!.valueChanges.pipe(startWith('')),
      this.destinationForm.get('plan')!.valueChanges.pipe(startWith(''))
    ]).pipe(
      switchMap(([ligneValue, planValue]) => {
        if (!ligneValue || !planValue) {
          return of([]);
        }
        return this.detailService.filtre(ligneValue.id_ligne, planValue.id_plan, '').pipe(
          map((response: VueGlobal[]) => new FonctionModele().cast(response)),
          tap(fonctions => this.fonctions = fonctions)
        );
      }),
      switchMap((fonctions: FonctionModele[]) => {
        return this.destinationForm.get('fonction')!.valueChanges.pipe(
          startWith(''),
          map(fonctionValue => {
            const filteredLibelles = this._filter(fonctions.map((obj: any) => obj.libelle), fonctionValue);
            return fonctions.filter((fonction: any) => filteredLibelles.includes(fonction.libelle));
          })
        );
      })
    );
  }

  submit() {
    if (this.destinationForm.valid) {
      this.onConfirm();
    } else {
      alert("Veuillez remplir tous les champs obligatoires.");
    }
  }

  onCancel(): void {
    // On ferme le modal sans rien renvoyer (ou en renvoyant 'false').
    this.dialogRef.close(false);
  }
}
