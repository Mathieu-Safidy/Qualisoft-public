import { inject, Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { DetailProjectService } from "./DetailProjectService";
import { forkJoin } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class MigrationResolver implements Resolve<any> {
    migrationService = inject(DetailProjectService);
    resolve() {
        let column = this.migrationService.getColonne('detail_projet', environment.tableDeplacement);
        return forkJoin({
            column: column
        });
    }

}