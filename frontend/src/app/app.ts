import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './component/navbar/navbar';
import { Corp } from "./component/corp/corp";
import { Footer } from "./component/footer/footer";

@Component({
  selector: 'app-root',
  imports: [Navbar, Corp, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'prod';
}
