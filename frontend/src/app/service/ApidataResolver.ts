// api-data.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectService } from './ProjectService'; // <-- ton service

@Injectable({ providedIn: 'root' })
export class ApiDataResolver implements Resolve<any> {
  constructor(private projectService: ProjectService) {}

  resolve(): Observable<any> {
    return this.projectService.getProjects(); // retourne Observable<any>
  }
}
