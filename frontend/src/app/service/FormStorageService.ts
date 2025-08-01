import { Injectable } from '@angular/core';



@Injectable({ providedIn: 'root' })
export class FormStorageService {
  private donnees: any = {};

  setData(data: any) {
    this.donnees = { ...this.donnees, ...data };
  }

  getData() {
    return this.donnees;
  }

  reset() {
    this.donnees = {};
  }
}