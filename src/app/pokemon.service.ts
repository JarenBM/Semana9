import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { Pokemon, PokemonListResponse } from './interfaces/pokemon.interface';
import { PokemonType } from './interfaces/pokemon-type.interface';

export interface PokemonPage {
  items: Pokemon[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

type IndexEntry = { name: string; url: string };

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly apiBase = 'https://pokeapi.co/api/v2';
  private readonly http = inject(HttpClient);

  // Índices cacheados: la lista completa de nombres y los índices por tipo
  // se piden solo una vez y después se reutilizan en cada búsqueda/filtro.
  private allIndex$?: Observable<IndexEntry[]>;
  private typeIndexCache = new Map<string, Observable<IndexEntry[]>>();

  /** Obtiene los tipos disponibles para el filtro */
  getTypes(): Observable<{ results: PokemonType[] }> {
    return this.http.get<{ results: PokemonType[] }>(`${this.apiBase}/type`);
  }

  /**
   * Lista paginada de Pokémon con búsqueda por nombre y filtro por tipo.
   * Con filtros, pagina sobre el índice completo (todos los Pokémon coincidentes);
   * sin filtros, usa el paginado nativo de la API.
   */
  getPokemonList(
    page = 1,
    pageSize = 12,
    searchTerm = '',
    typeFilter = '',
  ): Observable<PokemonPage> {
    const search = searchTerm.trim().toLowerCase();

    // Con filtros: buscar en el índice completo y paginar el resultado
    if (search || typeFilter) {
      return this.getFilteredIndex(search, typeFilter).pipe(
        switchMap((list) => {
          const totalItems = list.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
          const currentPage = Math.min(Math.max(1, page), totalPages);
          const slice = list.slice((currentPage - 1) * pageSize, currentPage * pageSize);
          return this.fetchDetails(slice).pipe(
            map((items) => ({
              items,
              totalItems,
              totalPages,
              currentPage,
              hasNext: currentPage < totalPages,
              hasPrev: currentPage > 1,
            })),
          );
        }),
        catchError((err) => {
          console.error('Error filtering pokemon index', err);
          return of(this.emptyPage(page));
        }),
      );
    }

    // Sin filtros: paginado nativo de la API
    const offset = (page - 1) * pageSize;
    const url = `${this.apiBase}/pokemon?limit=${pageSize}&offset=${offset}`;

    return this.http.get<PokemonListResponse>(url).pipe(
      switchMap((list) => {
        const totalPages = Math.max(1, Math.ceil(list.count / pageSize));
        const currentPage = Math.min(Math.max(1, page), totalPages);
        return this.fetchDetails(list.results).pipe(
          map((items) => ({
            items,
            totalItems: list.count,
            totalPages,
            currentPage,
            hasNext: !!list.next,
            hasPrev: !!list.previous,
          })),
        );
      }),
      catchError((err) => {
        console.error('Error fetching pokemon list', err);
        return of(this.emptyPage(page));
      }),
    );
  }

  /** Obtiene la descripción en inglés de la especie del Pokémon */
  getSpeciesDescription(name: string): Observable<string> {
    return this.http.get<any>(`${this.apiBase}/pokemon-species/${name}`).pipe(
      map((data) => {
        const entry = data.flavor_text_entries.find((f: any) => f.language.name === 'en');
        return entry?.text ? entry.text.replace(/\f/g, ' ') : 'Descripción no disponible';
      }),
      catchError(() => of('Descripción no disponible')),
    );
  }

  /** Obtiene el URL del sonido/cry del Pokémon */
  getPokemonCryUrl(name: string): Observable<string> {
    return this.http.get<any>(`${this.apiBase}/pokemon/${name}`).pipe(
      map((data) => data.cries?.latest ?? ''),
      catchError(() => of('')),
    );
  }

  /** Índice de nombres filtrado por nombre y/o tipo (con cache) */
  private getFilteredIndex(search: string, typeFilter: string): Observable<IndexEntry[]> {
    const source$ = typeFilter ? this.getTypeIndex(typeFilter) : this.getAllIndex();
    if (!search) return source$;
    return source$.pipe(map((list) => list.filter((p) => p.name.includes(search))));
  }

  /** Todos los Pokémon (una sola petición, cacheada) */
  private getAllIndex(): Observable<IndexEntry[]> {
    if (!this.allIndex$) {
      this.allIndex$ = this.http
        .get<PokemonListResponse>(`${this.apiBase}/pokemon?limit=100000`)
        .pipe(
          map((r) => r.results),
          catchError((err) => {
            console.error('Error loading pokemon index', err);
            return of([] as IndexEntry[]);
          }),
          shareReplay(1),
        );
    }
    return this.allIndex$;
  }

  /** Pokémon de un tipo (cacheado por tipo) */
  private getTypeIndex(type: string): Observable<IndexEntry[]> {
    let cached = this.typeIndexCache.get(type);
    if (!cached) {
      cached = this.http
        .get<{ pokemon: { pokemon: IndexEntry }[] }>(`${this.apiBase}/type/${type}`)
        .pipe(
          map((r) => r.pokemon.map((x) => x.pokemon)),
          catchError((err) => {
            console.error(`Error loading type index: ${type}`, err);
            return of([] as IndexEntry[]);
          }),
          shareReplay(1),
        );
      this.typeIndexCache.set(type, cached);
    }
    return cached;
  }

  /** Detalles de los Pokémon en una petición en paralelo (falla a vacío) */
  private fetchDetails(entries: IndexEntry[]): Observable<Pokemon[]> {
    if (entries.length === 0) return of([]);
    return forkJoin(
      entries.map((e) =>
        this.http.get<Pokemon>(e.url).pipe(catchError(() => of(this.emptyPokemon()))),
      ),
    );
  }

  private emptyPage(page: number): PokemonPage {
    return {
      items: [],
      totalItems: 0,
      totalPages: 1,
      currentPage: page,
      hasNext: false,
      hasPrev: false,
    };
  }

  private emptyPokemon(): Pokemon {
    return {
      id: 0,
      name: '',
      base_experience: 0,
      height: 0,
      weight: 0,
      sprites: { front_default: '' },
      types: [],
      stats: [],
    };
  }
}
