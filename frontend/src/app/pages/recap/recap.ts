import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Ligne } from '../../interface/Ligne';
import { Fonction } from '../../interface/Fonction';
import { Projet } from '../../interface/Projet';
import { TypeTraitement } from '../../interface/TypeTraitement';
import { Erreur } from '../../interface/Erreur';
import { Operation } from '../../interface/Operation';
import { Unite } from '../../interface/Unite';
import { ActivatedRoute } from '@angular/router';
import { DetailProjectService } from '../../service/DetailProjectService';

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

  lignes !: Ligne[];
  fonctions !: Fonction[];
  plans !: Projet[];
  typeTraitements !: TypeTraitement[];
  erreurs !: Erreur[];
  operations !: Operation[];
  unites !: Unite[];

  data = {
    ligne: [],
    fonction: [],
    plan: [],
    operation: [],
    typetraitements: [],
    erreurs: [],
    unites: []
  };

  constructor(private route: ActivatedRoute, private detailService: DetailProjectService) { }

  convertToValue(donne: { [key: string]: any }) {
    let value: { [key: string]: any } = {};
    this.colonne_plus.forEach(col => {
      value[col] = donne[col];
    });
    this.value_plus = value;
  }

  ngOnInit() {
    this.data = this.route.snapshot.data['data'];
    this.lignes = this.data.ligne;
    this.plans = this.data.plan;
    this.fonctions = this.data.fonction;
    this.operations = this.data.operation;
    this.typeTraitements = this.data.typetraitements;
    this.erreurs = this.data.erreurs;
    this.unites = this.data.unites;


    // this.ligne = `(${this.ligne}) - ${((this.lignes.find(ligne => ligne.id_ligne === this.ligne))?.libelle)}`;
    // this.plan = `(${this.plan}) - ${((this.plans.find(plan => plan.id_plan === this.plan))?.libelle)}`;
    // this.fonction = `(${this.fonction}) - ${((this.fonctions.find(fonction => fonction.id_fonction === this.fonction))?.libelle)}`;
    // this.operation = `(${this.operation}) ${((this.operations.find(operation => operation.id_operation === this.operation))?.libelle)}`;


    const donne = history.state.data;
    if (donne) {
      // console.log('Data received in recap:', donne);
    }
    this.convertToModel(donne);
    console.log(this.value_plus)
  }

  // ngAfterView() {
  //   this.detailService.getUnite().subscribe(res => {
  //     this.unites = res;
  //   });
  // }

  getLigne() {
    return `(${this.ligne}) - ${((this.lignes.find(ligne => ligne.id_ligne === this.ligne))?.libelle)}`;
  }

  getPlan() {
    return `(${this.plan}) - ${((this.plans.find(plan => plan.id_plan === this.plan))?.libelle)}`;
  }

  getFonction() {
    return `(${this.fonction}) - ${((this.fonctions.find(fonction => fonction.id_fonction === this.fonction))?.libelle)}`;
  }

  getTypeTraitement() {
    return `(${this.type_traite}) - ${this.typeTraitements.find(type => type.id_type_traitement === parseInt(this.type_traite))?.libelle}`
  }

  getOperation(id: string) {
    return `(${id} - ${(this.operations.find(operation => operation.id_operation === id))?.libelle})`
  }

  getUnite(id: string) {
    return this.unites?.length > 0 ? `(${id} - ${(this.unites.find(unite => unite.id_type_qte_act === parseInt(id)))?.libelle})` : '';
  }

  getDegre(deg: string) {
    // console.log('degre', typeof (deg), deg)
    if (deg.includes('0')) {
      return 'mineur';
    } else {
      return 'majeur';
    }
  }

  getTypeControl(control: string) {
    switch (control) {
      case '0':
        return 'Interne';
      case '1':
        return 'BCQ';
      case '2':
        return 'Externe';
      default:
        return 'vide';
        break;
    }
  }

  testAllNotEmpty(): boolean {
    return (
      !!this.ligne &&
      !!this.plan &&
      !!this.fonction &&
      !!this.type_traite &&
      !!this.descriptiont_traite &&
      !!this.client_nom &&
      !!this.interlocuteur_nom &&
      !!this.interlocuteur_contact &&
      !!this.cp_responsable &&
      Array.isArray(this.objectif_qualite) && this.objectif_qualite.length > 0 &&
      Array.isArray(this.type_erreur) && this.type_erreur.length > 0
      // Ajoute d'autres propriétés si besoin
    );
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
    const firstErreur: string[] = donne.colonne || [];
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
