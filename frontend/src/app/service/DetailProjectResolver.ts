// api-data.resolver.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { ProjectService } from './ProjectService'; // <-- ton service
import { DetailProjectService } from './DetailProjectService';
import { LigneModel } from '../class/LigneModel';
import { VueGlobal } from '../interface/VueGlobal';
import { ProjetModele } from '../class/ProjetModele';
import { FonctionModele } from '../class/FonctionModele';

@Injectable({ providedIn: 'root' })
export class DetailProjectResolver implements Resolve<any> {
  constructor(
    private detailService: DetailProjectService,
    private projectService: ProjectService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const plan = route.paramMap.get('id') ?? '';
    const ligne = '';
    const fonction = route.paramMap.get('fonction') ?? '';


    let { lignes, plans, fonctions } = this.getFilter(ligne, plan, fonction);

    // lignes.subscribe(data => console.log('📦 LIGNES:', data));
    // plans.subscribe(data => console.log('📦 PLANS:', data));
    // fonctions.subscribe(data => console.log('📦 FONCTIONS:', data));

    let { operations } = this.getData();

    let typetraitement = this.detailService.getTypeTraitement();

    typetraitement.subscribe(data => console.log('Type Traitemen :', data));
    let erreurType = this.detailService.getErreurType();

    return forkJoin({
      ligne: lignes,
      plan: plans,
      fonction: fonctions,
      operation: operations,
      typetraitements: typetraitement,
      erreurs: erreurType
    });
  }

  getFilter(ligne: string = "", plan: string = "", fonction: string = "") {
    const responses$ = this.detailService.filtre(ligne, plan, fonction).pipe(
      shareReplay(1)
    );

    const lignes$ = responses$.pipe(
      map(response => new LigneModel().cast(response))
    );

    const plans$ = responses$.pipe(
      map(response => new ProjetModele().cast(response))
    );

    const fonctions$ = lignes$.pipe(
      switchMap(lignes => {
        if (lignes.length > 0) {
          const idLigne0 = lignes[0].id_ligne;
          return this.detailService.filtre(idLigne0, plan, fonction);
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
      fonctions: fonctions$
    };
  }


  getData() {
    return { operations: this.detailService.getOperation() };
  }

}
