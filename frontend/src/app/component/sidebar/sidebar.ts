import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
onClickLink(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const menuDiv = target.closest('.menu');

  if (menuDiv) {
    const allMenus = document.querySelectorAll('.menu');
    allMenus.forEach(el => el.classList.remove('active'));

    menuDiv.classList.add('active');
  }
}

}
