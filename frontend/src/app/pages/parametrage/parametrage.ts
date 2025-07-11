import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Liste } from "../../component/liste/liste";

@Component({
  selector: 'app-parametrage',
  imports: [FontAwesomeModule, Liste],
  templateUrl: './parametrage.html',
  styleUrls: ['./parametrage.css']
})
export class Parametrage {
}
