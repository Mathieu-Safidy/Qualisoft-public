import { CommonModule } from '@angular/common';
import { Component, Inject, output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../service/auth-service';

@Component({
  selector: 'app-login',
  imports: [FontAwesomeModule, RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  formulaire!: FormGroup;
  loginStatus = output<boolean>();
  // authService = Inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.formulaire = this.fb.group({
      identfiant: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get formgroups() {
    return this.formulaire.controls;
  }

  async login() {
    if (this.formulaire.valid) {
      // console.log('Formulaire valide', this.formulaire.value);
      // this.loginStatus.emit(true);
      const { identfiant: username, password } = this.formulaire.getRawValue();
      await this.authService.login(username, password);
      this.router.navigate(['Dashboard'], { relativeTo: this.route });
    } else {
      this.formulaire.markAllAsTouched();
    }
  }
  //  handleLoginStatus(event: any) {
  //   const log = event.loginSuccess
  //   if (log) {
  //     this.loggedIn = true
  //     console.log('login ',this.loggedIn)
  //     this.router.navigate(['Dashboard'], { relativeTo: this.route } );
  //   }
  // }
}
