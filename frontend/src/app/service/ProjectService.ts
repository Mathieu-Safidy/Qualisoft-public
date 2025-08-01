import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Projet } from "../interface/Projet";
import { VueGlobal } from "../interface/VueGlobal";
@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private http = inject(HttpClient);
    
    getProjects() {
        return this.http.get<VueGlobal[]>('http://localhost:3000/projets');
    }
    
    
}