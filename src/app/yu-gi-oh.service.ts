import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { YugiohCard, YugiohResponse } from './interfaces/yu-gi-oh.interface';

/** API de Yu-Gi-Oh! (db.ygoprodeck.com) — sin clave y con CORS `*` */
@Injectable({ providedIn: 'root' })
export class YuGiOhService {
  private readonly base = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';
  private readonly http = inject(HttpClient);

  /**
   * Busca cartas por nombre (coincidencia parcial, sin distinguir mayúsculas).
   * La API responde 400 cuando no hay coincidencias → lista vacía (no es error).
   * Nota: sin parámetros la API devuelve toda la base (cientos de miles de cartas),
   * por eso siempre se exige una consulta.
   */
  searchCards(query: string): Observable<YugiohCard[]> {
    return this.http.get<YugiohResponse>(this.base, { params: { fname: query.trim() } }).pipe(
      map((res) => res.data ?? []),
      catchError((err: unknown) =>
        err instanceof HttpErrorResponse && err.status === 400 ? of([]) : throwError(() => err),
      ),
    );
  }
}
