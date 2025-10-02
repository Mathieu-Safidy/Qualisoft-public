import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiBackendHttp {
  private apiBack: string = environment.apiBack;
  private http = inject(HttpClient);

  async get(endpoint: string, withCredentials: boolean = true) {
    const url = this.apiBack + '/api' + endpoint;
    console.log('GET request to:', url);
    const data = await firstValueFrom(this.http.get(url, { withCredentials }));
    return data;
  }
  async post(endpoint: string, body: any, configuration?: any, withCredentials?: boolean) {
    const url = this.apiBack + '/api' + endpoint;
    const data = await firstValueFrom(
      this.http.post(url, body, { withCredentials: withCredentials ?? true, ...configuration })
    );
    return data;
  }

  postLoad(endpoint: string, body: any, configuration?: any, withCredentials?: boolean): Observable<HttpEvent<ArrayBuffer>> {
    const url = this.apiBack + '/api' + endpoint;
    const config = {
      withCredentials: withCredentials ?? true,
      observe: 'events' as const,         // ← important pour HttpEvent
      responseType: 'arraybuffer' as const, // ← correct TS type for arraybuffer
      ...configuration
    };
    return this.http.post<ArrayBuffer>(url, body, config);
  }
}
