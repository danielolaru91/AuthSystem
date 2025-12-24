import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  emailConfirmed: boolean;
}

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  email: string;
  emailConfirmed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this._http.get<User[]>(this._apiUrl);
  }

  getById(id: number): Observable<User> {
    return this._http.get<User>(`${this._apiUrl}/${id}`);
  }

  create(dto: CreateUserDto): Observable<User> {
    return this._http.post<User>(this._apiUrl, dto);
  }

  update(id: number, dto: UpdateUserDto): Observable<void> {
    return this._http.put<void>(`${this._apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/${id}`);
  }
}
