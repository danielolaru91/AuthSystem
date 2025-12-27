import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  emailConfirmed: boolean;
  roleId: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserDto {
  email: string;
  emailConfirmed: boolean;
  roleId: number;
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
    return this._http.put<void>(`${this._apiUrl}/${id}`, dto, { withCredentials: true });
  }

  delete(id: number): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/${id}`);
  }

  bulkDelete(ids: number[]) { 
    return this._http.post(`${this._apiUrl}/bulk-delete`, ids); 
  }
}
