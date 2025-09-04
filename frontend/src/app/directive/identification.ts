import { Directive, input, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Directive({
  selector: '[appIdentification]'
})
export class Identification {

  liste = input<any[]>([]);
  nom_colonne = input<string>('');
  valeur = input<string | number>('');
  form = input<FormGroup | null>(null)

  constructor() { }

  ngOnInit() {
    if (this.form()) {
      
    }
  }

}
