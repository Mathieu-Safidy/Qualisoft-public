import { Component, inject, Input } from '@angular/core';
import { ColumnDef, Liste } from '../liste/liste';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../service/ProjectService';
import { Projet } from '../../interface/Projet';
import { ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-project-list',
  imports: [Liste, RouterModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css'
})
export class ProjectList {

  @Input() form!: FormGroup;

  private projectService = inject(ProjectService);

  mesDonnees: Projet[] = [];

  colonnes: ColumnDef<Projet>[] = [
    { key: 'id_cgu', label: 'CGU', isSortable: true, isSearchable: true },
    { key: 'id_plan', label: 'Plan', isSortable: true, isSearchable: true },
    { key: 'libelle', label: 'Libellé', isSortable: true, isSearchable: true },
    { key: 'date_susp', label: 'Date suspension', isSortable: true },
  ];

  constructor(private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
    console.log('ProjectList constructor');
  }

  ngOnInit() {
    this.mesDonnees = this.route.snapshot.data['projects'];
    // this.projectService.getProjects().subscribe(data => {
    //   this.mesDonnees = data;
    //   this.cdr.markForCheck(); // si besoin de forcer la détection de changement
    // });
  }



  goToDetail = (row: any) => {
    // console.log('Navigating to detail for row:', row);
    this.router.navigate(['projet', row.id_plan], { relativeTo: this.route });
  }



}
