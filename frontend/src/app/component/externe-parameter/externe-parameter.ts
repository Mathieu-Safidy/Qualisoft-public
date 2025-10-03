import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input, output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { FaIconComponent, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Debounced } from '../../directive/debounced';
import { DetailProjectService } from '../../service/DetailProjectService';
import { MatDialog } from '@angular/material/dialog';
import { Confirm } from '../confirm/confirm';

@Component({
  selector: 'app-externe-parameter',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    Debounced,
    FormsModule,
    FormsModule
  ],
  templateUrl: './externe-parameter.html',
  styleUrl: './externe-parameter.css'
})
export class ExterneParameter {
  form = input<FormGroup>();
  projectID = input<number>();
  paramInterne = input<any[]>([]);
  addLigne = output<void>();
  // deleteLigne = output<number>();
  detailService = inject(DetailProjectService);
  fb = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);
  dialog = inject(MatDialog);
  paramModel: { id_champ_param_interne: string, onglet: string, colonne: string } = { id_champ_param_interne: '', onglet: '', colonne: '' };

  get paramExterne() {
    // console.log("Accès à paramExterne, form value:", this.form()?.value);
    return (this.form()?.get('indexation') as FormArray<FormGroup>).controls;
  }

  async updateValue(event: any, deleted: boolean = false) {
    const { id, value, name } = event;
    console.log("Debounced event:", event);
    return await this.detailService.updateUnitaire(id, value, name, deleted)
  }

  isIdParamInterne(item: any) {
    return this.paramInterne().some(param => param.id_champ_param_interne === item);
  }

  addLigneParam() {
    console.log("Ajout de la ligne avec paramModel:", this.paramModel);

    if (this.paramModel.id_champ_param_interne) {
      const event = {
        id: -1,
        value: {
          ...this.paramModel,
          id_projet: this.projectID()
        },
        name: 'detail_projet.param_externe'
      }

      this.updateValue(event).then((res: any) => {
        if (res && res.parametre && res.parametre.length > 0) {
          // let data = res.parametre[0];
          this.detailService.getExterne(this.projectID()!).then((response: any) => {
            const data = response;
            console.log("Data reçue après ajout:", data);
            data.forEach((item: any) => this.ajouterManquant(item));
          })
        }
        this.paramModel = { id_champ_param_interne: '', onglet: '', colonne: '' };
      });
    }
  }

  deleteLigneParam(index: number, id_param_externe: number) {

    let dialogref = this.dialog.open(Confirm, {
      data: { message: "Confirmez-vous la suppression de ce paramètre externe ?" }
    })

    dialogref.afterClosed().subscribe(result => {
      if (result) {
        const event = {
          id: id_param_externe,
          value: null,
          name: 'detail_projet.param_externe'
        }
        this.updateValue(event, true).then((res: any) => {
          if (res) {
            (this.form()?.get('indexation') as FormArray).removeAt(index);
            this.cdr.detectChanges();
          }
        });
      }
    })

  }



  verifParamExterne(item: any, param_externe: FormGroup[]) {
    return param_externe.some(param => param.get('id_champ_param_interne')?.value === item.id_champ_param_interne);
  }

  ajouterManquant(item: { libelle: string, id_champ_param_interne: string, id_param_externe: string, onglet: string, colonne: string }) {
    if (!this.verifParamExterne(item, this.paramExterne)) {
      this.paramExterne.push(this.fb.group({
        libelle: [item.libelle],
        id_champ_param_interne: [item.id_champ_param_interne],
        id_param_externe: [item.id_param_externe],
        onglet: [item.onglet],
        colonne: [item.colonne]
      }));
      console.log("Ajout de l'item manquant:", item);

      this.cdr.detectChanges();
    }
  }

}
