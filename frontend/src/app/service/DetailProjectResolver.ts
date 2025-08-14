// api-data.resolver.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';
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

    // const dataFilter = this.detailService.getDataFilter(ligne, plan, fonction);
    // if (!dataFilter) {
    //   throw new Error('Failed to get data filter');
    // }
    // const { lignes, plans, fonctions, operations, typetraitements, erreurTypes, unites, verifs, clients } = dataFilter;


    // return forkJoin({
    //   ligne: lignes,
    //   plan: plans,
    //   fonction: fonctions,
    //   operation: operations,
    //   typetraitements: typetraitements,
    //   erreurs: erreurTypes,
    //   unites: unites,
    //   verif: verifs,
    //   client: clients
    // });

    return this.detailService.resolveFilter(ligne,plan,fonction);
  }

 

}
