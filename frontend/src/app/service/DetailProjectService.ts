import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Projet } from '../interface/Projet';
import { Ligne } from '../interface/Ligne';
import { Fonction } from '../interface/Fonction';
import { VueGlobal } from '../interface/VueGlobal';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { Operation } from '../interface/Operation';
import { Unite } from '../interface/Unite';
import { TypeTraitement } from '../interface/TypeTraitement';
import { Erreur } from '../interface/Erreur';
import { ApiBackendHttp } from './api-backend-http';
import { environment } from '../../environments/environment';
import { LigneModel } from '../class/LigneModel';
import { ProjetModele } from '../class/ProjetModele';
import { FonctionModele } from '../class/FonctionModele';
import { Operations } from '../class/Operations';
@Injectable({
  providedIn: 'root',
})
export class DetailProjectService {
  private http = inject(ApiBackendHttp);
  private _http = inject(HttpClient);

  async getOperation() {
    const operation: Operation[] = (await this.http.get(
      '/operations'
    )) as Operation[];
    return operation;
  }

  async getUnite() {
    const unite: Unite[] = (await this.http.get('/unites')) as Unite[];
    return unite;
  }

  async getTypeTraitement() {
    const typeTraitement: TypeTraitement[] = (await this.http.get(
      '/typeTraitements'
    )) as TypeTraitement[];
    return typeTraitement;
  }

  async getErreurType() {
    const erreurType: Erreur[] = (await this.http.get('/erreurs')) as Erreur[];
    return erreurType;
  }

  filtre(ligne?: string, plan?: string, fonction?: string) {
    const body = { ligne, plan, fonction };
    const url = `${environment.apiBack}/api/filtres`
    let response = this._http.post<VueGlobal[]>(url, body, {
      withCredentials: true,
    });
    return response
  }

  async verifier(ligne: string, plan: string, fonction: string) {
    try {
      const response = await this.http.get(`/verifier/ligne/${ligne}/plan/${plan}/fonction/${fonction}`);
      return (response);
    } catch (error) {
      throw error;
    }
  }

  async getClient(client_id: string) {
    try {
      // const response = await this.http.get(`/client/${client_id}`);
      const response = await this.http.get(`/client/${client_id}`);
      return (response as any);
    } catch (error) {
      throw error;
    }
  }

  resolveFilter(ligne:any,plan:any,fonction:any) {
      // const plan = route.paramMap.get('id') ?? '';
      // const ligne = '';
      // const fonction = route.paramMap.get('fonction') ?? '';
    
        const dataFilter = this.getDataFilter(ligne, plan, fonction);
        if (!dataFilter) {
          throw new Error('Failed to get data filter');
        }
        const { lignes, plans, fonctions, operations, typetraitements, erreurTypes, unites, verifs, clients } = dataFilter;
    
    
        return forkJoin({
          ligne: lignes,
          plan: plans,
          fonction: fonctions,
          operation: operations,
          typetraitements: typetraitements,
          erreurs: erreurTypes,
          unites: unites,
          verif: verifs,
          client: clients
        });
  }
  async resolveFilterSimple(ligne:any,plan:any,fonction:any) {
      // const plan = route.paramMap.get('id') ?? '';
      // const ligne = '';
      // const fonction = route.paramMap.get('fonction') ?? '';
      try {
        const dataFilter = await this.getDataFilterSimple(ligne, plan, fonction);
        if (!dataFilter) {
          throw new Error('Failed to get data filter');
        }
        const { lignes, plans, fonctions, operations, typetraitements, erreurTypes, unites, verifs, clients } = dataFilter;
    
    
        return {
          ligne: lignes,
          plan: plans,
          fonction: fonctions,
          operation: operations,
          typetraitements: typetraitements,
          erreurs: erreurTypes,
          unites: unites,
          verif: verifs,
          client: clients
        };
        
      } catch (error) {
        console.log(error)
      }
      return 
  }

  getDataFilter(ligne: any, plan: any, fonction: any) {
    try {
      let filter = this.getFilter(ligne, plan, fonction);
      let { lignes, plans, fonctions , operations } = filter;
      lignes.subscribe(data => console.log('📦 LIGNES:', data));
      plans.subscribe(data => console.log('📦 PLANS:', data));
      fonctions.subscribe(data => console.log('📦 FONCTIONS:', data));
      
      // let { operations } = new Operations().cast();

      let typetraitement = this.getTypeTraitement();

      // typetraitement.subscribe(data => console.log('Type Traitemen :', data));
      let erreurType = this.getErreurType();

      let unite = this.getUnite();

      let verif = lignes.pipe(
        map(lignesArr => (lignesArr.length > 0 ? lignesArr[0].id_ligne : '')),
        switchMap(idLigne => {
          if (!idLigne || !plan || !fonction) {
            return of(null); // Ne pas appeler l'API si un paramètre est vide
          }
          return this.verifier(idLigne, plan, fonction);
        }),
        catchError(() => of(null))
      );

      let client = verif.pipe(
        map(verif => verif ? (verif as any).projet : null), // Accède à la propriété 'projet'
        switchMap((projet: any) => {
          if (projet && projet.id_client) {
            return this.getClient(projet.id_client);
          }
          return of(null);
        }),
        catchError(() => of(null))
      );

      return {
        lignes: lignes,
        plans: plans,
        fonctions: fonctions,
        operations: operations,
        typetraitements: typetraitement,
        erreurTypes: erreurType,
        unites: unite,
        verifs: verif,
        clients: client
      }
    } catch (error) {
      throw error
    }
    return null
  }
  async getDataFilterSimple(ligne: any, plan: any, fonction: any) {
    try {
      const { lignes, plans, fonctions, operation } = await this.getFilterSimple(ligne, plan, fonction);

      // let { operations } = this.getData();

      let typetraitement = this.getTypeTraitement();

      // typetraitement.subscribe(data => console.log('Type Traitemen :', data));
      let erreurType = this.getErreurType();

      let unite = this.getUnite();

      // let verif = lignes.pipe(
      //   map(lignesArr => (lignesArr.length > 0 ? lignesArr[0].id_ligne : '')),
      //   switchMap(idLigne => {
      //     if (!idLigne || !plan || !fonction) {
      //       return of(null); // Ne pas appeler l'API si un paramètre est vide
      //     }
      //     return this.verifier(idLigne, plan, fonction);
      //   }),
      //   catchError(() => of(null))
      // );

      let verif = await this.verifier(lignes[0].id_ligne, plan, fonction);

      let client = await this.getClient((verif as any).projet.id_client);

      // let client = verif.pipe(
      //   map(verif => verif ? (verif as any).projet : null), // Accède à la propriété 'projet'
      //   switchMap((projet: any) => {
      //     if (projet && projet.id_client) {
      //       return this.getClient(projet.id_client);
      //     }
      //     return of(null);
      //   }),
      //   catchError(() => of(null))
      // );

      return {
        lignes: lignes,
        plans: plans,
        fonctions: fonctions,
        operations: operation,
        typetraitements: typetraitement,
        erreurTypes: erreurType,
        unites: unite,
        verifs: verif,
        clients: client
      }
    } catch (error) {
      throw error
    }
    return null
  }

  getFilter(ligne: string = "", plan: string = "", fonction: string = "") {
    const responses$ = this.filtre(ligne, plan, fonction).pipe(
      shareReplay(1)
    );

    const lignes$ = responses$.pipe(
      map(response => new LigneModel().cast(response))
    );

    const plans$ = responses$.pipe(
      map(response => new ProjetModele().cast(response))
    );

    const operation$ = responses$.pipe(
      map(responsesv => new Operations().cast(responsesv))
    );

    const fonctions$ = lignes$.pipe(
      switchMap(lignes => {
        if (lignes.length > 0) {
          const idLigne0 = lignes[0].id_ligne;
          return this.filtre(idLigne0, plan, fonction);
        } else {
          return of([]);
        }
      }),
      map(res => new FonctionModele().cast(res))
    );



    // ✅ On retourne un objet contenant les 3 observables
    return {
      lignes: lignes$,
      plans: plans$,
      fonctions: fonctions$,
      operations: operation$
    };
  }
  async getFilterSimple(ligne: string = "", plan: string = "", fonction: string = "") {
    const responses$ = await firstValueFrom(this.filtre(ligne, plan, fonction))
      

    const lignes$ = new LigneModel().cast(responses$);

    const plans$ = new ProjetModele().cast(responses$);

    const operation$ = new Operations().cast(responses$);

    const fonctions$ = new FonctionModele().cast(await firstValueFrom(this.filtre(lignes$[0].id_ligne, plan, fonction)));

    // ✅ On retourne un objet contenant les 3 promises
    return {
      lignes: lignes$,
      plans: plans$,
      fonctions: fonctions$,
      operation: operation$
    };
  }


  getData() {
    return { operations: this.getOperation() };
  }


}


// getTypeTraitement() {
//     return this.http.get<TypeRtr
// }


// const vueGlobal: VueGlobal[] = (await this.http.post(
//   '/filtre',
//   body
// )) as VueGlobal[];
// return vueGlobal;

// return this.http.get<Erreur[]>('http://localhost:5000/api/erreur', {
//   withCredentials: true,
// });

// return this.http.get<TypeTraitement[]>(
//   'http://localhost:4000/typeTraitement',
//   { withCredentials: true }
// );


// return this.http.get<Unite[]>('http://localhost:3000/unite', {
//   withCredentials: true,
// });

// async getProjects() {
//   // return this.http.get<Projet[]>('http://localhost:3000/projets', {
//   //   withCredentials: true,
//   // });
//   const projets: Projet[] = (await this.http.get('/projets')) as Projet[];
//   return projets;
// }


// return this.http.get<Operation[]>('http://localhost:3000/operations', {
//   withCredentials: true,
// });

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
