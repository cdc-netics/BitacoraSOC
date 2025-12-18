import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { TagStats } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private readonly API_URL = `${environment.apiUrl}/tags`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<TagStats[]> {
    return this.http.get<TagStats[]>(`${this.API_URL}/stats`);
  }

  getList(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/list`);
  }

  suggest(query: string): Observable<TagStats[]> {
    return this.http.get<TagStats[]>(`${this.API_URL}/suggest`, {
      params: { q: query }
    });
  }
}
