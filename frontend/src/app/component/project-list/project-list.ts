import { Component, inject, input } from '@angular/core';
import { ColumnDef, Liste } from '../liste/liste';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../service/ProjectService';
import { Projet } from '../../interface/Projet';
import { ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { VueGlobal } from '../../interface/VueGlobal';
import { MatDialog } from '@angular/material/dialog';
import { Clonage } from '../clonage/clonage';

@Component({
  selector: 'app-project-list',
  imports: [Liste, RouterModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css'
})
export class ProjectList {

  readonly form = input.required<FormGroup>();

  private projectService = inject(ProjectService);

  mesDonnees: VueGlobal[] = [];

  colonnes: ColumnDef<VueGlobal>[] = [
    { key: 'id_cgu', label: 'CGU' },
    { key: 'id_plan', label: 'Plan', isSortable: true, isSearchable: true },
    { key: 'lib_plan', label: 'Libellé plan', isSortable: true, isSearchable: true },
    { key: 'id_fonction', label: 'Fonction', isSortable: true, isSearchable: true },
    { key: 'lib_fonction', label: 'Libellé fonction', isSortable: true, isSearchable: true },
  ];

  constructor(private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef,
    public dialog: MatDialog) {
    console.log('ProjectList constructor');
  }

  ngOnInit() {
    this.mesDonnees = this.route.snapshot.data['projects'].projects;
    console.log(this.mesDonnees);
    // this.projectService.getProjects().subscribe(data => {
    //   this.mesDonnees = data;
    //   this.cdr.markForCheck(); // si besoin de forcer la détection de changement
    // });
  }
  openSimpleModal(event: any): void {
    console.log('Ouverture du modal de clonage pour l\'élément:', event);
    this.dialog.open(Clonage, {
      width: '100vh',
      height: 'auto',
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: {
        title: 'Confirmation du transfert',
        source: {
          ligneId: '0000',
          ligneName: 'Ligne Principale',
          planId: event.id_plan,
          planName: event.lib_plan,
          fonctionId: event.id_fonction,
          fonctionName: event.lib_fonction
        },
        destination: {
          ligneId: '',
          ligneName: '',
          planId: 0,
          planName: '',
          fonctionId: 0,
          fonctionName: ''
        }
      }
    });
  }


  goToDetail = (row: any) => {
    // console.log('Navigating to detail for row:', row);
    this.router.navigate(['projet', row.id_plan, row.id_fonction], { relativeTo: this.route });
  }



}
