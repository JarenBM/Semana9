import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PokemonService } from '../../pokemon.service';
import { Pokemon } from '../../interfaces/pokemon.interface';
import { PokemonType } from '../../interfaces/pokemon-type.interface';
import { AudioService } from '../../audio.service';
import { TitleCasePipe } from '../../pipes/title-case.pipe';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TitleCasePipe],
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.css'],
})
export class PokedexComponent implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  private readonly audio = inject(AudioService);

  // Estado reactivo
  pokemons = signal<Pokemon[]>([]);
  types = signal<PokemonType[]>([]);
  searchTerm = signal('');
  selectedType = signal('');
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  hasNext = signal(false);
  hasPrev = signal(false);
  loading = signal(false);
  error = signal('');

  // Tarjeta expandida y su descripción
  expandedPokemon = signal<Pokemon | null>(null);
  speciesDesc = signal('');

  readonly pageSize = 12;

  ngOnInit(): void {
    this.loadTypes();
    this.loadPokemons();
  }

  loadTypes(): void {
    this.pokemonService.getTypes().subscribe({
      next: (result) => this.types.set(result.results),
      error: () => this.error.set('No se pudieron cargar los tipos'),
    });
  }

  loadPokemons(): void {
    this.loading.set(true);
    this.error.set('');

    this.pokemonService
      .getPokemonList(this.currentPage(), this.pageSize, this.searchTerm(), this.selectedType())
      .subscribe({
        next: (result) => {
          this.pokemons.set(result.items);
          this.totalItems.set(result.totalItems);
          this.totalPages.set(result.totalPages);
          // La página real puede diferir si se pidió fuera de rango
          this.currentPage.set(result.currentPage);
          this.hasNext.set(result.hasNext);
          this.hasPrev.set(result.hasPrev);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los Pokémon. Revisa tu conexión.');
          this.loading.set(false);
        },
      });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadPokemons();
  }

  onTypeChange(): void {
    this.currentPage.set(1);
    this.loadPokemons();
  }

  nextPage(): void {
    if (!this.hasNext()) return;
    this.currentPage.update((p) => p + 1);
    this.loadPokemons();
    this.audio.play('navigate');
  }

  prevPage(): void {
    if (!this.hasPrev()) return;
    this.currentPage.update((p) => p - 1);
    this.loadPokemons();
    this.audio.play('navigate');
  }

  /** Alterna la tarjeta expandida; al abrir carga la descripción de la especie */
  expandPokemon(pokemon: Pokemon): void {
    const collapsing = this.expandedPokemon()?.id === pokemon.id;
    this.expandedPokemon.set(collapsing ? null : pokemon);
    this.speciesDesc.set('');
    if (collapsing) return;

    this.pokemonService.getSpeciesDescription(pokemon.name).subscribe({
      next: (desc) => {
        // Ignorar si mientras tanto se cambió de tarjeta
        if (this.expandedPokemon()?.id === pokemon.id) {
          this.speciesDesc.set(desc);
        }
      },
      error: () => this.speciesDesc.set('No se pudo cargar la descripción'),
    });
  }

  getImageUrl(pokemon: Pokemon): string {
    return (
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      pokemon.sprites.front_default ??
      ''
    );
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };
    return colors[type] ?? '#68A090';
  }

  /** Reproduce el cry del Pokémon (sonido real de PokeAPI o beep de respaldo) */
  playCry(pokemon: Pokemon): void {
    this.pokemonService.getPokemonCryUrl(pokemon.name).subscribe({
      next: (url) => (url ? this.audio.playFromUrl(url) : this.audio.beep()),
      error: () => this.audio.beep(),
    });
  }
}
