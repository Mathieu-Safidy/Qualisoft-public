import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  readonly projectName = input('');

  constructor(private router: Router) { }


  // ngOnInit() {
  //   this.router.events.subscribe(event => {
  //     if (event instanceof NavigationEnd) {
  //       const currentUrl = event.urlAfterRedirects;

  //       const allMenus = document.querySelectorAll('.menu');

  //       allMenus.forEach(el => {
  //         const lien = el.querySelector('a');
  //         let href = '';
  //         if (lien) {
  //           href = lien.getAttribute('routerLink') || '';
  //         }
  //         console.log('href', href, 'currentUrl', currentUrl );
  //         if (href && (href === currentUrl || (href !== '/' || href !== this.projectName && currentUrl.startsWith(href)))) {
  //           el.classList.add('active');
  //         } else {
  //           el.classList.remove('active');
  //         }
  //       });
  //     }
  //   });
  // }
  
  // ngOnInit() {
  //   this.router.events.subscribe(event => {
  //     if (event instanceof NavigationEnd) {
  //       let currentUrl = event.urlAfterRedirects;
  //       const projectPrefix = `/${this.projectName}`;

  //       // Nettoyer l’URL en enlevant le préfixe
  //       if (currentUrl.startsWith(projectPrefix)) {
  //         currentUrl = currentUrl.slice(projectPrefix.length);
  //         if (!currentUrl.startsWith('/')) currentUrl = '/' + currentUrl;
  //       }

  //       const allMenus = document.querySelectorAll('.menu');

  //       allMenus.forEach(el => {
  //         const lien = el.querySelector('a');
  //         let href = '';
  //         if (lien) {
  //           href = lien.getAttribute('routerLink') || '';
  //         }
  //         const lienactuel = currentUrl.split('/').filter(Boolean);
  //         if (lienactuel.length > 1) {
            
  //         }
  //         // Inclus si la route actuelle contient le chemin défini
  //         // console.log(href,currentUrl,lienactuel,href && href.includes(currentUrl) && currentUrl !== "/" || href && href === '/'+this.projectName && currentUrl === "/" || lienactuel.length > 1 && href.includes(lienactuel[0]))
  //         if (href && href.includes(currentUrl) && currentUrl !== "/" || href && href === '/'+this.projectName && currentUrl === "/" || lienactuel.length > 1 && href.includes(lienactuel[0])) {
  //           el.classList.add('active');
  //         } else {
  //           el.classList.remove('active');
  //         }
  //       });
  //     }
  //   });
  // }


}
