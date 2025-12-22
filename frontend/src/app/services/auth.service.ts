import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthModel {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private readonly _http = inject(HttpClient);
    private readonly _apiUrl = environment.apiUrl;

    register(credentials: AuthModel): Observable<any> {
        return this._http.post(`${this._apiUrl}/register`, credentials);
    }

    login(credentials: { email: string; password: string }) {
        return this._http.post(`${this._apiUrl}/login`, credentials, { withCredentials: true });
    }

    logout() {
        return this._http.post(`${this._apiUrl}/logout`, {}, { withCredentials: true });
    }
}
