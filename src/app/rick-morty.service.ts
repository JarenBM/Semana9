import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { RickMortyPage } from './interfaces/rick-morty.interface';

/** Respuesta vacía usada cuando la búsqueda no tiene coincidencias (404) */
const PAGINA_VACIA: RickMortyPage = {
  info: { count: 0, pages: 0, next: null, prev: null },
  results: [],
};

/** API de Rick and Morty (rickandmortyapi.com) — sin clave y con CORS `*` */
@Injectable({ providedIn: 'root' })
export class RickMortyService {
  private readonly base = 'https://rickandmortyapi.com/api/character';
  private readonly http = inject(HttpClient);

  /**
   * Personajes paginados con búsqueda por nombre y filtro de estado.
   * La API responde 404 cuando no hay coincidencias → lista vacía (no es error).
   */
  getCharacters(page = 1, name = '', status = ''): Observable<RickMortyPage> {
    let params = new HttpParams().set('page', page);
    if (name.trim()) {
      params = params.set('name', name.trim());
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http
      .get<RickMortyPage>(this.base, { params })
      .pipe(
        catchError((err: unknown) =>
          err instanceof HttpErrorResponse && err.status === 404
            ? of(PAGINA_VACIA)
            : throwError(() => err),
        ),
      );
  }
}
