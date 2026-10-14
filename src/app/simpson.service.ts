import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SimpsonCharacter, SimpsonEpisode, SimpsonPage } from './interfaces/simpson.interface';

/**
 * API de Los Simpson (thesimpsonsapi.com)
 * - Sin clave de API y con CORS `*`
 * - Sin búsqueda server-side: solo paginación de 20 elementos por página
 * - Imágenes servidas desde el CDN https://cdn.thesimpsonsapi.com/500
 */
@Injectable({ providedIn: 'root' })
export class SimpsonService {
  private readonly base = 'https://thesimpsonsapi.com/api';
  private readonly cdn = 'https://cdn.thesimpsonsapi.com/500';
  private readonly http = inject(HttpClient);

  /** Página de personajes (60 páginas en total) */
  getCharacters(page = 1): Observable<SimpsonPage<SimpsonCharacter>> {
    return this.http.get<SimpsonPage<SimpsonCharacter>>(`${this.base}/characters?page=${page}`);
  }

  /** Página de episodios (39 páginas en total) */
  getEpisodes(page = 1): Observable<SimpsonPage<SimpsonEpisode>> {
    return this.http.get<SimpsonPage<SimpsonEpisode>>(`${this.base}/episodes?page=${page}`);
  }

  /** URL absoluta de una imagen (path relativo → CDN) */
  imageUrl(path?: string): string {
    return path ? `${this.cdn}${path}` : '';
  }
}
