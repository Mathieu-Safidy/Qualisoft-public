import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-login',
  imports: [FontAwesomeModule,RouterModule,ReactiveFormsModule,CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  
  formulaire !: FormGroup;
  constructor( private fb : FormBuilder , private router : Router , private route : ActivatedRoute){

  this.formulaire = this.fb.group({
      identfiant : ['',Validators.required],
      password : ['',Validators.required]
    })
  };

  get formgroups () {
    return this.formulaire.controls;
  }
  
  login() {
    if (this.formulaire.valid) {
      console.log(this.formulaire.value);
      this.router.navigate(['Acceuil'],{relativeTo: this.route});
    } else {
      this.formulaire.markAllAsTouched();
    }
  }
}
