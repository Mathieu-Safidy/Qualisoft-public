import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  constructor(private authService : AuthService , private router : Router , private route: ActivatedRoute) {}

  logout() {
    this.authService.logout();
    this.router.navigate([''], { relativeTo: this.route } );
  }

  ngAfterViewInit(): void {
    const bread = document.getElementById('bread');
    const sidebar = document.getElementById('sidebar');
    const indexs = document.querySelectorAll('.index');
    const menu = document.querySelectorAll('.menu');

    // console.log("bread", bread);

    if (bread && sidebar) {
      bread.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.toggle('collapsed');

        indexs.forEach(element => {
          if (isCollapsed) {
            element.classList.add('d-none');
          } else {
            element.classList.remove('d-none');
          }
        });

        menu.forEach(element => {
          if (isCollapsed) {
            element.classList.remove('ps-3');
          } else {
            element.classList.add('ps-3');
          }
        });
      });
    }
  }
}
