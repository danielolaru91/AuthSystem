import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Company {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/companies';

  getAll() {
    return this.http.get<Company[]>(this.api);
  }

  create(data: { name: string }) {
    return this.http.post(this.api, data);
  }

  update(id: number, data: { name: string }) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  bulkDelete(ids: number[]) { 
    return this.http.post(`${this.api}/bulk-delete`, ids); 
  }
}
