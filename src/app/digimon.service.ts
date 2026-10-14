import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { Digimon } from './interfaces/digimon.interface';

/** API de Digimon (digimon-api.vercel.app) — sin clave y con CORS `*` */
@Injectable({ providedIn: 'root' })
export class DigimonService {
  private readonly base = 'https://digimon-api.vercel.app/api/digimon';
  private readonly http = inject(HttpClient);

  private todos$?: Observable<Digimon[]>;

  /**
   * Lista completa de Digimon (≈400 entradas, ~20 kB).
   * Se pide una sola vez y se cachea; si falla se limpia el cache para poder reintentar.
   */
  getAll(): Observable<Digimon[]> {
    if (!this.todos$) {
      this.todos$ = this.http.get<Digimon[]>(this.base).pipe(
        catchError((err) => {
          this.todos$ = undefined;
          return throwError(() => err);
        }),
        shareReplay(1),
      );
    }
    return this.todos$;
  }
}
