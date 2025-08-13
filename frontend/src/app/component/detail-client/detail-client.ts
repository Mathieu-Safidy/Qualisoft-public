import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
    MatInputModule
  ],
  templateUrl: './detail-client.html',
  styleUrl: './detail-client.css'
})
export class DetailClient {
  form = input<FormGroup>();
  fb = inject(FormBuilder);

  get FormGroup() {
    return this.form()?.get('interlocuteur') as FormArray<FormGroup>;
  }

  addLigne() {
    let formGroup = this.fb.group({
      nom_interlocuteur: ['',[Validators.required]],
      contact_interlocuteur: ['',[Validators.required,Validators.email]]
    });

    this.FormGroup.push(formGroup);
    
  }

  deleteLigne(index: number) {
    this.FormGroup.removeAt(index);
  }

  checkValid() {
    // const formArray = this.formArray as FormArray<FormGroup>;
    if (!this.FormGroup) {
      console.log('Le formulaire principal ou le FormGroup est introuvable.');
      // return;
    }

    this.FormGroup.controls.forEach((group, index) => {
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

    console.log('Form value',this.form()?.value)

    console.log('Formulaire principal valide :', this.form()?.valid);
  }
}
