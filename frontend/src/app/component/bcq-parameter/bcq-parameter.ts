import { Component, inject, input, output } from '@angular/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FaIconComponent, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Debounced } from '../../directive/debounced';
import { DetailProjectService } from '../../service/DetailProjectService';
@Component({
  selector: 'app-bcq-parameter',
  imports: [
    NgbPopoverModule,
    MatBadgeModule,
    MatTabsModule,
    CommonModule,
    ReactiveFormsModule,
    FaIconComponent,
    FontAwesomeModule,
    Debounced
  ],
  templateUrl: './bcq-parameter.html',
  styleUrl: './bcq-parameter.css'
})
export class BcqParameter {
  form = input<FormGroup>();
  addStockage = output<void>();
  deleteStockage = output<number>();
  detailService = inject(DetailProjectService);
  projectID = input<number>(-1);

  get stockageArray() {
    return this.form()?.get('stockage') as FormArray<FormGroup>;
  }

  get consigneGroup() {
    return this.form()?.get('consigne') as FormGroup;
  }

  async updateValueConsigne(event: any) {
    const { id, value, name } = event;
    console.log("Debounced event:", event);
    let result: any = await this.detailService.updateUnitaire(id, value, name)
    console.log("Update result:", result);
    if (result?.parametre?.length) {
      const updated = result.parametre[0];
        let updateLigne = this.consigneGroup.get('id_param_bcq');
        if (updateLigne) {
          updateLigne.setValue(updated.id_param_bcq);
        }
        console.log("Ligne mise à jour avec id_param_bcq:", updated.id_param_bcq, updateLigne);
      }
    console.log("Fin updateValue");
  }
  
  async updateValueInfo(event: any) {
    const { id, value, name } = event;
    let { id_projet, id_param_bcq, libelle, valeur, position } = value;
    let newvalue = { 'id_projet': id_projet, 'id_param_bcq': id_param_bcq, 'libelle': libelle , 'valeur': valeur};
    console.log("Debounced event:", event , 'position', position, 'newvalue', newvalue);

    let result: any = await this.detailService.updateUnitaire(id, newvalue, name)
    console.log("Update result:", result);
    if (result?.parametre?.length) {
      const updated = result.parametre[0];
        let updateLigne = this.stockageArray.at(position);
        updateLigne.patchValue({
          id_info_bcq: updated.id_info_bcq,
          libelle: updated.libelle,
          emplacement: updated.valeur
        });
        console.log("Ligne mise à jour avec id_info_bcq:", updated.id_info_bcq, updateLigne);
      }
    console.log("Fin updateValue");
  }
}
