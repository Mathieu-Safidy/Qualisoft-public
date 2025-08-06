import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ColumnDef, Liste } from "../../component/liste/liste";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProjectList } from '../../component/project-list/project-list';


@Component({
  selector: 'app-parametrage',
  imports: [
    FontAwesomeModule, 
    RouterOutlet, 
    RouterModule, 
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule 
  ],
  templateUrl: './parametrage.html',
  styleUrls: ['./parametrage.css']
})
export class Parametrage {

  form1: FormGroup;

  constructor(private location: Location ,  private fb: FormBuilder) {
    this.form1 = this.fb.group({
        ligne: ['',Validators.required],
        plan: ['',Validators.required],
        fonction: ['',Validators.required],
        description_traite: ['',Validators.required],
        type_traite: ['',Validators.required],
        client_nom: ['',Validators.required],
        interlocuteur_nom: ['',Validators.required],
        contact_interlocuteur: ['',[Validators.required,Validators.email]],
        cp_responsable: ['',Validators.required],
    });
  }

  goBack() {
    this.location.back();
  }
}
