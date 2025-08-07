// api-data.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, firstValueFrom, forkJoin, from } from 'rxjs';
import { ProjectService } from './ProjectService'; // <-- ton service
import { VueGlobal } from '../interface/VueGlobal';

@Injectable({ providedIn: 'root' })
export class ApiDataResolver implements Resolve<any> {
  constructor(private projectService: ProjectService) {}

  resolve(): Observable<any> {
    this.projectService.getProjects().then(projects => console.log(projects));
    return forkJoin({
      projects:this.projectService.getProjects()
    }); 
  }
}
