/** Información de paginación de Rick and Morty API */
export interface RickMortyInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

/** Referencia a una localización (origen/ubicación actual) */
export interface RickMortyLocationRef {
  name: string;
  url: string;
}

/** Personaje de Rick and Morty API */
export interface RickMortyCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  type?: string;
  gender: string;
  image: string;
  origin: RickMortyLocationRef;
  location: RickMortyLocationRef;
}

/** Respuesta paginada de personajes */
export interface RickMortyPage {
  info: RickMortyInfo;
  results: RickMortyCharacter[];
}
