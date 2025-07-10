import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Container } from "../container/container";

@Component({
  selector: 'app-corps',
  imports: [Sidebar, Container],
  templateUrl: './corp.html',
  styleUrl: './corp.css'
})
export class Corp {

}
