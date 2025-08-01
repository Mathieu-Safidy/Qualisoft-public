import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Projet } from "../interface/Projet";
import { Ligne } from "../interface/Ligne";
import { Fonction } from "../interface/Fonction";
import { VueGlobal } from "../interface/VueGlobal";
import { Observable } from "rxjs";
import { Operation } from "../interface/Operation";
import { Unite } from "../interface/Unite";
import { TypeTraitement } from "../interface/TypeTraitement";
import { Erreur } from "../interface/Erreur";
@Injectable({
    providedIn: 'root'
})
export class DetailProjectService {
    private http = inject(HttpClient);

    // getProjects() {
    //     return this.http.get<Projet[]>('http://localhost:3000/projets');
    // }

    // getPlan() {
    //     return this.http.get()
    // }

    getLigne() {
        return this.http.get<Ligne[]>('http://localhost:3000/lignes');
    }

    getLigneByPlan(plan: string) {
        return this.http.get<VueGlobal[]>('http://localhost:3000/');
    }

    getFonction() {
        return this.http.get<Fonction[]>('http://localhost:3000/fonctions');
    }

    getOperation() {
        return this.http.get<Operation[]>('http://localhost:3000/operations');
    }

    getProjects() {
        return this.http.get<Projet[]>('http://localhost:3000/projets');
    }

    getUnite() {
        return this.http.get<Unite[]>('http://localhost:3000/unite');
    }

    getTypeTraitement() {
        return this.http.get<TypeTraitement[]>('http://localhost:4000/typeTraitement')
    }

    getErreurType() {
        return this.http.get<Erreur[]>('http://localhost:4000/erreurs');
    }

    filtre(ligne?: string , plan?: string, fonction?: string): Observable<VueGlobal[]> {
        const body = { ligne, plan, fonction };
        return this.http.post<VueGlobal[]>('http://localhost:3000/filtre', body);
    }







    // getTypeTraitement() {
    //     return this.http.get<TypeRtr
    // }

}