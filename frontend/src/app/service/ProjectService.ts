import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Projet } from "../interface/Projet";
@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private http = inject(HttpClient);
    
    getProjects() {
        return this.http.get<Projet[]>('http://localhost:3000/projets');
    }
}