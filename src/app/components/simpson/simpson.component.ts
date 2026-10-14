import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SimpsonService } from '../../simpson.service';
import { SimpsonCharacter, SimpsonEpisode } from '../../interfaces/simpson.interface';

type Pestana = 'personajes' | 'episodios';

@Component({
  selector: 'app-simpson',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './simpson.component.html',
  styleUrls: ['./simpson.component.css'],
})
export class SimpsonComponent implements OnInit {
  private readonly simpsonService = inject(SimpsonService);

  /** URL absoluta de las imágenes del CDN */
  readonly imageUrl = (path?: string): string => this.simpsonService.imageUrl(path);

  pestana = signal<Pestana>('personajes');

  personajes = signal<SimpsonCharacter[]>([]);
  paginaPersonajes = signal(1);
  paginasPersonajes = signal(1);
  totalPersonajes = signal(0);

  episodios = signal<SimpsonEpisode[]>([]);
  paginaEpisodios = signal(1);
  paginasEpisodios = signal(1);
  totalEpisodios = signal(0);

  cargando = signal(false);
  error = signal('');
  frase = signal<{ personaje: string; texto: string } | null>(null);

  paginaActual = computed(() =>
    this.pestana() === 'personajes' ? this.paginaPersonajes() : this.paginaEpisodios(),
  );
  paginasTotales = computed(() =>
    this.pestana() === 'personajes' ? this.paginasPersonajes() : this.paginasEpisodios(),
  );
  personajesCargados = computed(() => this.personajes().length > 0);
  episodiosCargados = computed(() => this.episodios().length > 0);

  ngOnInit(): void {
    this.cargarPersonajes();
  }

  cambiarPestana(pestana: Pestana): void {
    if (this.pestana() === pestana) return;
    this.pestana.set(pestana);
    this.error.set('');
    if (pestana === 'personajes' && this.personajes().length === 0) {
      this.cargarPersonajes();
    }
    if (pestana === 'episodios' && this.episodios().length === 0) {
      this.cargarEpisodios();
    }
  }

  cargarPersonajes(): void {
    this.cargando.set(true);
    this.error.set('');
    this.simpsonService.getCharacters(this.paginaPersonajes()).subscribe({
      next: (res) => {
        this.personajes.set(res.results);
        this.paginasPersonajes.set(res.pages);
        this.totalPersonajes.set(res.count);
        this.cargando.set(false);
        this.sortearFrase();
      },
      error: () => {
        this.error.set('No se pudo conectar con la API de Los Simpson.');
        this.cargando.set(false);
      },
    });
  }

  cargarEpisodios(): void {
    this.cargando.set(true);
    this.error.set('');
    this.simpsonService.getEpisodes(this.paginaEpisodios()).subscribe({
      next: (res) => {
        this.episodios.set(res.results);
        this.paginasEpisodios.set(res.pages);
        this.totalEpisodios.set(res.count);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los episodios.');
        this.cargando.set(false);
      },
    });
  }

  siguiente(): void {
    if (this.pestana() === 'personajes') {
      if (this.paginaPersonajes() < this.paginasPersonajes()) {
        this.paginaPersonajes.update((p) => p + 1);
        this.cargarPersonajes();
      }
    } else if (this.paginaEpisodios() < this.paginasEpisodios()) {
      this.paginaEpisodios.update((p) => p + 1);
      this.cargarEpisodios();
    }
  }

  anterior(): void {
    if (this.pestana() === 'personajes') {
      if (this.paginaPersonajes() > 1) {
        this.paginaPersonajes.update((p) => p - 1);
        this.cargarPersonajes();
      }
    } else if (this.paginaEpisodios() > 1) {
      this.paginaEpisodios.update((p) => p - 1);
      this.cargarEpisodios();
    }
  }

  reintentar(): void {
    if (this.pestana() === 'personajes') {
      this.cargarPersonajes();
    } else {
      this.cargarEpisodios();
    }
  }

  /** Elige una frase célebre al azar entre los personajes ya cargados */
  sortearFrase(): void {
    const lista = this.personajes();
    if (lista.length === 0) return;
    const personaje = lista[Math.floor(Math.random() * lista.length)];
    const frases = personaje.phrases ?? [];
    const texto =
      frases.length > 0 ? frases[Math.floor(Math.random() * frases.length)] : '¡Sin frase célebre!';
    this.frase.set({ personaje: personaje.name, texto });
  }
}
