import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiBackendHttp {
  private apiBack: string = environment.apiBack;
  private http = inject(HttpClient);

  async get(endpoint: string, withCredentials: boolean = true) {
    const url = this.apiBack + '/api' + endpoint;
    const data = await firstValueFrom(this.http.get(url, { withCredentials }));
    return data;
  }
  async post(endpoint: string, body: any, withCredentials: boolean = true) {
    const url = this.apiBack + '/api' + endpoint;
    const data = await firstValueFrom(
      this.http.post(url, body, { withCredentials })
    );
    return data;
  }
}
