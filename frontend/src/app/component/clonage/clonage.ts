import { Component, inject, Inject, input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { map, Observable, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CacheData } from '../../service/cache-data';
import { ActivatedRoute, Router } from '@angular/router';
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

  destinationForm!: FormGroup;
  cacheData = inject(CacheData);
  lignes: string[] = ['Ligne 101', 'Ligne 102', 'Ligne 103'];
  plans: string[] = ['Plan A', 'Plan B', 'Plan C']; // NOUVEAU
  fonctions: string[] = ['Fonction A', 'Fonction B', 'Fonction C'];

  filteredLignes$!: Observable<string[]>;
  filteredPlans$!: Observable<string[]>; // NOUVEAU
  filteredFonctions$!: Observable<string[]>;

  ngOnInit() {
    this.destinationForm = new FormGroup({
      ligne: new FormControl(''),
      plan: new FormControl(''), // NOUVEAU
      fonction: new FormControl('')
    });

    this.filteredLignes$ = this.destinationForm.get('ligne')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.lignes, value || ''))
    );

    // NOUVEAU : Observer les changements de valeur du champ 'plan'
    this.filteredPlans$ = this.destinationForm.get('plan')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.plans, value || ''))
    );

    this.filteredFonctions$ = this.destinationForm.get('fonction')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.fonctions, value || ''))
    );
  }

  private _filter(options: string[], value: string): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }
  

  onClose(): void {
    // La méthode close() ferme le modal. Vous pouvez aussi lui passer une valeur.
    this.dialogRef.close();
  }

  onConfirm(): void {
    // On ferme le modal et on renvoie 'true' au composant appelant.
    
    let value = { destination: { ...this.destinationForm.value } };
    console.log('data cloning ',value);
    this.cacheData.setData(value);
    this.dialogRef.close(true);
    let plan = this.data.source.planId;
    let fonction = this.data.source.fonctionId;
    this.router.navigate(['/Dashboard/parametrage/projet', plan, fonction]);
  }

  onCancel(): void {
    // On ferme le modal sans rien renvoyer (ou en renvoyant 'false').
    this.dialogRef.close(false);
  }
}
