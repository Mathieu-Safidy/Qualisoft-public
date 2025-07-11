import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './component/navbar/navbar';
import { Footer } from "./component/footer/footer";
import { Corp } from './component/corp/corp';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCoffee, faUser, faBlog, faGear, faArrowLeft, faArrowAltCircleLeft, faArrowRight, faChevronRight , } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  imports: [Navbar, Footer, Corp,FontAwesomeModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'prod';
  constructor(library: FaIconLibrary) {
    library.addIcons(faCoffee, faUser, faBlog , faGear , faArrowLeft , faArrowAltCircleLeft , faArrowRight , faChevronRight);
  }
}
