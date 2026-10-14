import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RickMortyService } from '../../rick-morty.service';
import { RickMortyCharacter } from '../../interfaces/rick-morty.interface';

@Component({
  selector: 'app-rick-morty',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rick-morty.component.html',
  styleUrls: ['./rick-morty.component.css'],
})
export class RickMortyComponent implements OnInit {
  private readonly rickMortyService = inject(RickMortyService);

  readonly estados = [
    { valor: '', etiqueta: 'Todos los estados' },
    { valor: 'alive', etiqueta: 'Vivo' },
    { valor: 'dead', etiqueta: 'Muerto' },
    { valor: 'unknown', etiqueta: 'Desconocido' },
  ];

  busqueda = signal('');
  estado = signal('');
  pagina = signal(1);

  personajes = signal<RickMortyCharacter[]>([]);
  totalPaginas = signal(0);
  totalPersonajes = signal(0);
  cargando = signal(false);
  error = signal('');
  hayFiltros = signal(false);

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.rickMortyService.getCharacters(this.pagina(), this.busqueda(), this.estado()).subscribe({
      next: (res) => {
        this.personajes.set(res.results);
        this.totalPaginas.set(res.info.pages);
        this.totalPersonajes.set(res.info.count);
        this.hayFiltros.set(this.busqueda().trim() !== '' || this.estado() !== '');
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con la API de Rick y Morty.');
        this.cargando.set(false);
      },
    });
  }

  /** Botón "Buscar": reinicia la paginación */
  buscarDesdeCero(): void {
    this.pagina.set(1);
    this.buscar();
  }

  /** Cambio del filtro de estado: aplica de inmediato */
  cambiarEstado(valor: string): void {
    this.estado.set(valor);
    this.pagina.set(1);
    this.buscar();
  }

  siguiente(): void {
    if (this.pagina() < this.totalPaginas()) {
      this.pagina.update((p) => p + 1);
      this.buscar();
    }
  }

  anterior(): void {
    if (this.pagina() > 1) {
      this.pagina.update((p) => p - 1);
      this.buscar();
    }
  }

  reintentar(): void {
    this.buscar();
  }

  colorEstado(status: string): string {
    if (status === 'Alive') return '#16a34a';
    if (status === 'Dead') return '#dc2626';
    return '#9ca3af';
  }

  etiquetaEstado(status: string): string {
    if (status === 'Alive') return 'Vivo';
    if (status === 'Dead') return 'Muerto';
    return 'Desconocido';
  }
}
