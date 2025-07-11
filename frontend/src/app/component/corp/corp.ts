import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Container } from "../container/container";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-corps',
  imports: [Sidebar, RouterModule],
  templateUrl: './corp.html',
  styleUrl: './corp.css'
})
export class Corp {

}
