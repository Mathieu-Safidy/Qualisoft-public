import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-recap',
  imports: [
    CommonModule
  ],
  templateUrl: './recap.html',
  styleUrl: './recap.css'
})
export class Recap {
  ligne: string = '';
  plan: string = '';
  fonction: string = '';
  type_traite: string = '';
  descriptiont_traite: string = '';
  client_nom: string = '';
  interlocuteur_nom: string = '';
  interlocuteur_contact: string = '';
  cp_responsable: string = '';
  objectif_qualite: {
    operation: string;
    unite: string;
    seuil_qualite: number;
    type_de_control: string;
    critere_de_rejet: number;
  }[] = [];
  type_erreur: {
    type_erreur: string,
    degre: string,
    coef: number,
    raccourci: string
  }[] = [];

  colonne_plus: string[] = [];

  value_plus: Record<string, any> = {};

  convertToValue(donne: { [key: string]: any }) {
    let value: { [key: string]: any } = {};
    this.colonne_plus.forEach(col => {
      value[col] = donne[col];
    });
    this.value_plus = value;
  }

  ngOnInit() {
    const donne = history.state.data;
    if (donne) {
      console.log('Data received in recap:', donne);
    }
    this.convertToModel(donne);
    console.log(this.value_plus)
  }
  convertToModel(donne: any) {
    // Champs fixes
    this.ligne = donne.ligne || '';
    this.plan = donne.plan || '';
    this.fonction = donne.fonction || '';
    this.type_traite = donne.type_traite || '';
    this.descriptiont_traite = donne.description_traite || '';
    this.client_nom = donne.client_nom || '';
    this.interlocuteur_nom = donne.interlocuteur_nom || '';
    this.interlocuteur_contact = donne.contact_interlocuteur || '';
    this.cp_responsable = donne.cp_responsable || '';

    // Objectif qualité
    this.objectif_qualite = (donne.formArray || []).map((item: any) => ({
      operation: item.operation,
      unite: item.unite,
      seuil_qualite: item.seuilQualite,
      type_de_control: item.typeControl,
      critere_de_rejet: item.critereRejet
    }));

    // Type d'erreurs
    this.type_erreur = (donne.formErreur || []).map((item: any) => ({
      type_erreur: item.typeErreur,
      degre: item.degre,
      coef: item.coef,
      raccourci: item.raccourci
    }));

    // Colonnes dynamiques
    const firstErreur : string[] = donne.colonne || [];
    const result: Record<string, any> = {};

    firstErreur.forEach(col => {
      donne.formErreur.forEach((erreur: any, index: number) => {
        console.log(col, donne.formErreur[index][col])
        if (donne.formErreur[index][col] !== undefined) {
          result[col] = donne.formErreur[index][col];
        }  
      })
    });
    this.colonne_plus = firstErreur;
    this.value_plus = result;
  }



}
