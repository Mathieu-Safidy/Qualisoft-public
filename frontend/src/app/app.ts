import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Route, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './component/navbar/navbar';
import { Footer } from "./component/footer/footer";
import { Corp } from './component/corp/corp';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCoffee, faUser, faBlog, faGear, faArrowLeft, faArrowAltCircleLeft, faArrowRight, faChevronRight, faPlusCircle, faMinusCircle, faKey, } from '@fortawesome/free-solid-svg-icons';
import { Login } from './pages/login/login';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [FontAwesomeModule, RouterOutlet, CommonModule, Corp, Login],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  loggedIn = false
  private domaine = "Acceuil"
  protected title = 'prod';
  constructor(library: FaIconLibrary, private router: Router, private route: ActivatedRoute) {
    library.addIcons(faCoffee, faUser, faBlog, faGear, faArrowLeft, faArrowAltCircleLeft, faArrowRight, faChevronRight, faArrowRight, faPlusCircle, faMinusCircle, faUser, faKey);
  }
  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let currentUrl = event.urlAfterRedirects;
        const projectPrefix = `/${this.domaine}`;

        // Nettoyer l’URL en enlevant le préfixe
        if (currentUrl.startsWith(projectPrefix)) {
          currentUrl = currentUrl.slice(projectPrefix.length);
          if (!currentUrl.startsWith('/')) currentUrl = '/' + currentUrl;
        }

        const allMenus = document.querySelectorAll('.menu');

        allMenus.forEach(el => {
          const lien = el.querySelector('a');
          let href = '';
          if (lien) {
            href = lien.getAttribute('routerLink') || '';
          }
          const lienactuel = currentUrl.split('/').filter(Boolean);
          if (lienactuel.length > 1) {

          }
          // Inclus si la route actuelle contient le chemin défini
          // console.log(href,currentUrl,lienactuel,href && currentUrl.includes(href) && currentUrl !== "/" || href && href === '/'+this.domaine && currentUrl === "/" || href && lienactuel.length > 1 && lienactuel[0].includes(href))
          if (href && currentUrl.includes(href) && currentUrl !== "/" || href && href === '/' + this.domaine && currentUrl === "/" || lienactuel.length > 1 && lienactuel[0].includes(href)) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        });
      }
    });
  }
  handleLoginStatus(loginSuccess: boolean) {
    if (loginSuccess) {
      this.loggedIn = true
      this.router.navigate(['Acceuil'], { relativeTo: this.route });
    }
  }
}
