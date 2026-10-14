import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DigimonService } from '../../digimon.service';
import { Digimon } from '../../interfaces/digimon.interface';

/** Colores por nivel de evolución */
const COLORES_NIVEL: Record<string, string> = {
  fresh: '#0ea5e9',
  'in training': '#38bdf8',
  rookie: '#16a34a',
  champion: '#d97706',
  ultimate: '#ea580c',
  mega: '#dc2626',
  armor: '#7c3aed',
  variable: '#0d9488',
  unknown: '#64748b',
};

/** Orden canónico de evolución para el selector de niveles */
const ORDEN_NIVELES = [
  'Fresh',
  'In Training',
  'Rookie',
  'Champion',
  'Ultimate',
  'Mega',
  'Armor',
  'Variable',
  'Unknown',
];

@Component({
  selector: 'app-digimon',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './digimon.component.html',
  styleUrls: ['./digimon.component.css'],
})
export class DigimonComponent implements OnInit {
  private readonly digimonService = inject(DigimonService);

  readonly porPagina = 24;

  todos = signal<Digimon[]>([]);
  busqueda = signal('');
  nivel = signal('');
  pagina = signal(1);
  cargando = signal(false);
  error = signal('');

  /** Niveles presentes en los datos, en orden de evolución */
  niveles = computed(() => {
    const presentes = new Set(this.todos().map((d) => d.level));
    const enOrden = ORDEN_NIVELES.filter((n) => presentes.has(n));
    const extras = [...presentes].filter((n) => !ORDEN_NIVELES.includes(n)).sort();
    return [...enOrden, ...extras];
  });

  /** Filtrado por nombre y nivel (sobre la lista completa cacheada) */
  filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const nivel = this.nivel();
    return this.todos().filter(
      (d) =>
        (texto === '' || d.name.toLowerCase().includes(texto)) &&
        (nivel === '' || d.level === nivel),
    );
  });

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / this.porPagina)));

  /** Tarjetas de la página actual */
  visibles = computed(() => {
    const inicio = (this.pagina() - 1) * this.porPagina;
    return this.filtrados().slice(inicio, inicio + this.porPagina);
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.digimonService.getAll().subscribe({
      next: (lista) => {
        this.todos.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con la API de Digimon.');
        this.cargando.set(false);
      },
    });
  }

  /** La búsqueda es local: no hace falta volver a la API */
  onBusqueda(valor: string): void {
    this.busqueda.set(valor);
    this.pagina.set(1);
  }

  onNivel(valor: string): void {
    this.nivel.set(valor);
    this.pagina.set(1);
  }

  siguiente(): void {
    if (this.pagina() < this.totalPaginas()) {
      this.pagina.update((p) => p + 1);
    }
  }

  anterior(): void {
    if (this.pagina() > 1) {
      this.pagina.update((p) => p - 1);
    }
  }

  colorNivel(level: string): string {
    return COLORES_NIVEL[level.toLowerCase()] ?? '#64748b';
  }
}
