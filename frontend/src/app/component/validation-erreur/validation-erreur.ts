import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
@Component({
  selector: 'app-validation-erreur',
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    MatRadioModule
  ],
  templateUrl: './validation-erreur.html',
  styleUrl: './validation-erreur.css'
})
export class ValidationErreur {
  selected: any = null;
  data = inject(MAT_DIALOG_DATA);
  form = this.data.form;
  dialogRef = inject(MatDialogRef<ValidationErreur>);

  confirm() {
    if (this.selected && this.data.form) {
      // Exemple : mettre à jour un champ du FormGroup
      this.form.patchValue({ [this.data.map]: this.selected });
      this.data.validation = true;
      console.log('selected id : ', this.selected, ' data ', this.data , this.form.value);
      // this.data.form.patchValue({ [this.data.reference]: this.selected[this.data.reference] });
    }
    this.dialogRef.close({ value:this.selected, validation: true });
  }

  close() {
    console.log('close dialog . liste : ', this.data.liste);
    this.data.validation = false;
    this.dialogRef.close({ value: null, validation: false });
  }
}
