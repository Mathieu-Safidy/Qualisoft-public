import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Container } from "../container/container";
import { RouterModule } from "@angular/router";
import { Navbar } from "../navbar/navbar";
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-corps',
  imports: [Sidebar, RouterModule, Navbar, Footer],
  templateUrl: './corp.html',
  styleUrl: './corp.css'
})
export class Corp {
    title = "Acceuil";
}
