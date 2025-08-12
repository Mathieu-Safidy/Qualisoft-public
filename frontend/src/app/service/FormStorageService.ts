import { inject, Injectable } from '@angular/core';
import { ApiBackendHttp } from './api-backend-http';



@Injectable({ providedIn: 'root' })
export class FormStorageService {
  private http = inject(ApiBackendHttp);

  async parametrage(parametrage: any) : Promise<any> {
    try {
      const response = await this.http.post('/parametrage', parametrage);
      return response;
    } catch (error) {
      console.error('Error fetching parametrage:', error);
      throw error;
    }
  }

  async updateParametre(parametrage: any) : Promise<any> {
    try {
      const response = await this.http.post('/update', parametrage);
      return response
    } catch (error) {
      throw error;
    }
  }
}