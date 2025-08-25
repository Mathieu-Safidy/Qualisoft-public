import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { CookieService } from 'ngx-cookie-service'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  private apiBack = environment.apiBack

  constructor(private http: HttpClient, private cookies: CookieService) {
    const storedMatricule = localStorage.getItem('matricule');
    if (storedMatricule) {
      this.loggedIn = true;
    }
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  async login(username: string, password: string) {
    const url = `${this.apiBack}/api/login`
    const authData: any = await firstValueFrom(this.http.post(url, { username, password }, { withCredentials: true }))
    localStorage.setItem('matricule', authData.user.matricule);
    this.loggedIn = true;
  }

  async logout() {
    const url = `${this.apiBack}/api/logout`
    await firstValueFrom(this.http.get(url, { withCredentials: true }))
    localStorage.removeItem('matricule');
    this.loggedIn = false;
  }
}
