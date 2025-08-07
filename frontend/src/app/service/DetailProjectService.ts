import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Projet } from '../interface/Projet';
import { Ligne } from '../interface/Ligne';
import { Fonction } from '../interface/Fonction';
import { VueGlobal } from '../interface/VueGlobal';
import { Observable } from 'rxjs';
import { Operation } from '../interface/Operation';
import { Unite } from '../interface/Unite';
import { TypeTraitement } from '../interface/TypeTraitement';
import { Erreur } from '../interface/Erreur';
import { ApiBackendHttp } from './api-backend-http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class DetailProjectService {
  private http = inject(ApiBackendHttp);
  private _http = inject(HttpClient);
  // getProjects() {
  //     return this.http.get<Projet[]>('http://localhost:3000/projets');
  // }

  // getPlan() {
  //     return this.http.get()
  // }

  // async getLigne() {
  //   // return this.http.get<Ligne[]>('http://localhost:3000/lignes', {
  //   //   withCredentials: true,
  //   // });
  //   const ligne: Ligne[] = (await this.http.get('/lignes')) as Ligne[];
  //   return ligne;
  // }

  // async getLigneByPlan(plan: string) {
  //   // return this.http.get<VueGlobal[]>('http://localhost:3000/', {
  //   //   withCredentials: true,
  //   // });
  //   const ligne: Ligne[] = (await this.http.get('/')) as Ligne[];
  //   return ligne;
  // }

  // async getFonction() {
  //   // return this.http.get<Fonction[]>('http://localhost:3000/fonctions', {
  //   //   withCredentials: true,
  //   // });
  //   const fonction: Fonction[] = (await this.http.get(
  //     '/fonctions'
  //   )) as Fonction[];
  //   return fonction;
  // }

  async getOperation() {
    // return this.http.get<Operation[]>('http://localhost:3000/operations', {
    //   withCredentials: true,
    // });
    const operation: Operation[] = (await this.http.get(
      '/operations'
    )) as Operation[];
    return operation;
  }

  // async getProjects() {
  //   // return this.http.get<Projet[]>('http://localhost:3000/projets', {
  //   //   withCredentials: true,
  //   // });
  //   const projets: Projet[] = (await this.http.get('/projets')) as Projet[];
  //   return projets;
  // }

  async getUnite() {
    // return this.http.get<Unite[]>('http://localhost:3000/unite', {
    //   withCredentials: true,
    // });
    const unite: Unite[] = (await this.http.get('/unites')) as Unite[];
    return unite;
  }

  async getTypeTraitement() {
    // return this.http.get<TypeTraitement[]>(
    //   'http://localhost:4000/typeTraitement',
    //   { withCredentials: true }
    // );
    const typeTraitement: TypeTraitement[] = (await this.http.get(
      '/typeTraitements'
    )) as TypeTraitement[];
    return typeTraitement;
  }

  async getErreurType() {
    // return this.http.get<Erreur[]>('http://localhost:5000/api/erreur', {
    //   withCredentials: true,
    // });
    const erreurType: Erreur[] = (await this.http.get('/erreurs')) as Erreur[];
    return erreurType;
  }

  filtre(ligne?: string, plan?: string, fonction?: string) {
    const body = { ligne, plan, fonction };
    // const vueGlobal: VueGlobal[] = (await this.http.post(
    //   '/filtre',
    //   body
    // )) as VueGlobal[];
    // return vueGlobal;
    const url = `${environment.apiBack}/api/filtres`
    return this._http.post<VueGlobal[]>(url, body, {
      withCredentials: true,
    });
  }

  // getTypeTraitement() {
  //     return this.http.get<TypeRtr
  // }
}
