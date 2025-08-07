import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Projet } from "../interface/Projet";
import { VueGlobal } from "../interface/VueGlobal";
import { ApiBackendHttp } from "./api-backend-http";
@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private http = inject(ApiBackendHttp);
    
    async getProjects() {
        console.log('Trouver projet');
        return (await this.http.get(`/projets`)) as VueGlobal[];
    }
    
    
}