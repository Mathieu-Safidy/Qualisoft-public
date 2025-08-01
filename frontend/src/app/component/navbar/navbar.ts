import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
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
