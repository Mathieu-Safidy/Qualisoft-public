import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Corp } from './component/corp/corp';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCoffee, faUser, faBlog, faGear, faArrowLeft, faArrowAltCircleLeft, faArrowRight, faChevronRight, faPlusCircle, faMinusCircle, faKey, faTrash, } from '@fortawesome/free-solid-svg-icons';
import { Login } from './pages/login/login';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { SpinnerService } from './service/SpinnerService';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-root',
  imports: [ 
    FontAwesomeModule, 
    RouterOutlet, 
    CommonModule,
    ProgressSpinnerModule,
    MatChipsModule,
    // BrowserAnimationsModule,
    MatDialogModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  loggedIn = false
  spinnerService = inject(SpinnerService);
  private domaine = "Dashboard"
  protected title = 'prod';
  constructor(library: FaIconLibrary, private router: Router, private route: ActivatedRoute) {
    library.addIcons(faCoffee, faUser, faBlog, faGear, faArrowLeft, faArrowAltCircleLeft, faArrowRight, faChevronRight, faArrowRight, faPlusCircle, faMinusCircle, faUser, faKey, faTrash);
  }
  ngOnInit() {
    // console.log("test")
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let currentUrl = event.urlAfterRedirects;
        const projectPrefix = `/${this.domaine}`;
        // const projectPrefix = "";

        // Nettoyer l’URL en enlevant le préfixe
        if (currentUrl.startsWith(projectPrefix)) {
          currentUrl = currentUrl.slice(projectPrefix.length);
          if (!currentUrl.startsWith('/')) currentUrl = '/' + currentUrl;
        }

        const allMenus = document.querySelectorAll('.menu');

        allMenus.forEach(el => {
          // console.log(allMenus)
          const lien = el.querySelector('a');
          let href = '';
          if (lien) {
            href = lien.getAttribute('routerLink') || '';
          }
          const lienactuel = currentUrl.split('/').filter(Boolean);
          const isHome = ((href && (lien?.getAttribute('routerLink') === '')) || lienactuel.length == 0 && href.includes(this.domaine)) && (currentUrl === '/');
          const isIncluded = href && currentUrl.includes(href) && currentUrl !== '/';

          // console.log('href:', href, 'currentUrl:', currentUrl, 'lienactuel:', lienactuel);
          const isSubMenu = lienactuel.length > 1 && lienactuel[0].includes(href);

          // console.log('isHome:', isHome, 'isIncluded:', isIncluded, 'isSubMenu:', isSubMenu);

          if (isHome || isIncluded || isSubMenu) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        });
      }
    });
  }
  handleLoginStatus(event: any) {
    const log = event.loginSuccess
    if (log) {
      this.loggedIn = true
      // console.log('login ',this.loggedIn)
      this.router.navigate(['Dashboard'], { relativeTo: this.route } );
    }
  }
}
