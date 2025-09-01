import { Directive, input, Input } from '@angular/core';

@Directive({
  selector: '[appIdentification]'
})
export class Identification {

  identity = input<string | number>();

  constructor() { }

}
