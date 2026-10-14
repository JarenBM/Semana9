/** Personaje de la API de Los Simpson (thesimpsonsapi.com) */
export interface SimpsonCharacter {
  id: number;
  age?: number;
  birthdate?: string;
  gender?: string;
  name: string;
  occupation?: string;
  portrait_path?: string;
  phrases?: string[];
  status?: string;
}

/** Episodio de la API de Los Simpson */
export interface SimpsonEpisode {
  id: number;
  airdate?: string;
  episode_number?: number;
  image_path?: string;
  name: string;
  season?: number;
  synopsis?: string;
}

/** Respuesta paginada de la API (20 elementos por página) */
export interface SimpsonPage<T> {
  count: number;
  next: string | null;
  prev: string | null;
  pages: number;
  results: T[];
}
