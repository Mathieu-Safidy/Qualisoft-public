import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FaIconComponent, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Debounced } from '../../directive/debounced';
import { DetailProjectService } from '../../service/DetailProjectService';

@Component({
  selector: 'app-externe-parameter',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    Debounced
  ],
  templateUrl: './externe-parameter.html',
  styleUrl: './externe-parameter.css'
})
export class ExterneParameter {
  form =  input<FormGroup>();
  projectID = input<number>();
  addLigne = output<void>();
  deleteLigne = output<number>();
  detailService = inject(DetailProjectService);

  get paramExterne() {
    console.log("Accès à paramExterne, form value:", this.form()?.value);
    return (this.form()?.get('indexation') as FormArray<FormGroup>).controls;
  }

  async updateValue(event: any) {
    const { id, value , name } = event;
    console.log("Debounced event:", event);
    await this.detailService.updateUnitaire(id, value, name)
  }

}
