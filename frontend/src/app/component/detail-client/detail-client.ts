import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Debounced } from '../../directive/debounced';
import { DetailProjectService } from '../../service/DetailProjectService';
import { MatDialog } from '@angular/material/dialog';
import { Confirm } from '../confirm/confirm';

@Component({
  selector: 'app-detail-client',
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
    Debounced
  ],
  templateUrl: './detail-client.html',
  styleUrl: './detail-client.css'
})
export class DetailClient {
  form = input<FormGroup>();
  fb = inject(FormBuilder);
  verifier = input<any>();
  dialog = inject(MatDialog);

  projectID = input<number>(-1);
  detailService = inject(DetailProjectService);
  cdref: ChangeDetectorRef = inject(ChangeDetectorRef);
  // async updateValue(event: any) {
  //   const { id, value, name } = event;
  //   console.log("Debounced event:", event);
  //   let result = await this.detailService.updateUnitaire(id, value, name)
  //   console.log("Update result:", result);
  // }

  async updateValue(event: any) {
    let { id, value, name } = event;
    let deleted = false;
    if (value.nom_interlocuteur == '') {
      deleted = true;
    }
    console.log('requete', value.nom_interlocuteur, 'envoyer', { id, value, name, deleted });
    const result: any = await this.detailService.updateUnitaire(id, value, name, deleted);
    console.log('resultat', result);

    if (result?.parametre?.length) {
      const updated = result.parametre[0];

      const interlocuteurs = this.form()?.get('interlocuteur') as FormArray<FormGroup>;

      const index = interlocuteurs.controls.findIndex(
        ctrl => ctrl.get('nom_interlocuteur')?.value === updated.nom_interlocuteur
      );

      console.log('index trouvé', index, updated);

      if (index !== -1) {
        const group = interlocuteurs.at(index);

        Object.keys(updated).forEach(key => {
          if (group.get(key)) {
            group.get(key)?.setValue(updated[key], { emitEvent: false });
          }
        });
        if (!updated.nom_interlocuteur) {
          group.get('id_interlocuteur')?.setValue(-1, { emitEvent: false });
        }
      } else {
        console.warn("Aucune ligne trouvée pour nom_interlocuteur :", updated.nom_interlocuteur);
      }
      if (deleted) {
        this.deleteLigne(index);
      }
    } else {
      const interlocuteurs = this.form()?.get('interlocuteur') as FormArray<FormGroup>;
      const index = interlocuteurs.controls.findIndex(
        ctrl => ctrl.get('id_interlocuteur')?.value === id
      );
      if (index !== -1) {
        const group = interlocuteurs.at(index);
        group.get('id_interlocuteur')?.setValue(-1, { emitEvent: false });
      }
    }
  }


  get FormGroup() {
    return this.form()?.get('interlocuteur') as FormArray<FormGroup>;
  }



  addLigne() {
    let formGroup = this.fb.group({
      id_interlocuteur: [-1],
      nom_interlocuteur: ['', [Validators.required]],
      contact_interlocuteur: this.fb.control(
        { value: '', disabled: true }, // ⬅️ désactivé par défaut
        [Validators.required, Validators.email]
      )
    });

    // 🔑 Abonnement dynamique
    formGroup.get('nom_interlocuteur')?.valueChanges.subscribe(value => {
      const contactCtrl = formGroup.get('contact_interlocuteur');
      if (!value) {
        contactCtrl?.disable({ emitEvent: false });
        contactCtrl?.reset(); // optionnel : vider le champ
      } else {
        contactCtrl?.enable({ emitEvent: false });
      }
    });

    this.FormGroup.push(formGroup);
  }


  deleteLigne(index: number) {
    let dialogref = this.dialog.open(Confirm, {
      data: { message: 'Êtes-vous sûr de vouloir supprimer cet interlocuteur ?' }
    })

    dialogref.afterClosed().subscribe(result => {
      if (result) {
        let id_interlocuteur = this.FormGroup.at(index)?.get('id_interlocuteur')?.value;
        let name = 'detail_projet.interlocuteur';
        this.detailService.deleteDonne(id_interlocuteur, name)
          .then((result: any) => {
            console.log('Suppression réussie', result, this.FormGroup.at(index));
            if (this.FormGroup) {
              this.FormGroup.removeAt(index);
              this.cdref.detectChanges();
            }
          })
          .catch((error: any) => { alert(error.message); });
      }
    })

  }

  checkValid() {
    // const formArray = this.formArray as FormArray<FormGroup>;
    if (!this.FormGroup) {
      // console.log('Le formulaire principal ou le FormGroup est introuvable.');
      // return;
    }

    this.FormGroup.controls.forEach((group, index) => {
      const invalidControls = Object.keys(group.controls).filter(controlName => {
        const control = group.get(controlName);
        return control && control.invalid;
      });

      if (invalidControls.length > 0) {
        // console.log(`FormGroup à l'index ${index} a des champs invalides :`, invalidControls);
        invalidControls.forEach(controlName => {
          const control = group.get(controlName);
          // console.log(`- Champ "${controlName}" :`, control?.errors);
        });
      } else {
        console.log(`FormGroup à l'index ${index} est valide.`);
      }
    });

    console.log('Form value', this.form()?.value)

    console.log('Formulaire principal valide :', this.form()?.valid);
  }
}
