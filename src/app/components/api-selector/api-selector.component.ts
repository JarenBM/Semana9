import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../audio.service';

/** Ficha de una API presentada en el selector */
interface ApiCard {
  titulo: string;
  emoji: string;
  descripcion: string;
  ruta: string;
  dominio: string;
  caracteristicas: string[];
  color: string;
}

@Component({
  selector: 'app-api-selector',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './api-selector.component.html',
  styleUrls: ['./api-selector.component.css'],
})
export class ApiSelectorComponent {
  private readonly audio = inject(AudioService);

  readonly apis: ApiCard[] = [
    {
      titulo: 'Pokédex',
      emoji: '⚡',
      descripcion:
        'Explora los más de 1000 Pokémon con búsqueda por nombre, filtro por tipo y tarjetas 3D que suenan.',
      ruta: '/pokemon',
      dominio: 'pokeapi.co',
      caracteristicas: ['Búsqueda global', 'Filtro por tipo', 'Tarjetas 3D', 'Sonido'],
      color: '#ef4444',
    },
    {
      titulo: 'Los Simpson',
      emoji: '🍩',
      descripcion:
        'Personajes y episodios de Springfield: retratos, ocupaciones, frases célebres y temporadas completas.',
      ruta: '/simpson',
      dominio: 'thesimpsonsapi.com',
      caracteristicas: ['1182 personajes', '768 episodios', 'Frases', 'Retratos'],
      color: '#eab308',
    },
    {
      titulo: 'Rick y Morty',
      emoji: '🧪',
      descripcion:
        'Los 826 personajes del multiverso con búsqueda instantánea por nombre y filtro de estado (vivo, muerto…).',
      ruta: '/rick-morty',
      dominio: 'rickandmortyapi.com',
      caracteristicas: ['Búsqueda', 'Filtro de estado', '42 páginas', 'Fotos'],
      color: '#14b8a6',
    },
    {
      titulo: 'Digimon',
      emoji: '🧬',
      descripcion:
        'La línea evolutiva completa: busca por nombre y filtra por nivel, desde Fresh hasta Mega.',
      ruta: '/digimon',
      dominio: 'digimon-api.vercel.app',
      caracteristicas: ['Búsqueda', 'Filtro por nivel', 'Evoluciones'],
      color: '#f97316',
    },
    {
      titulo: 'Yu-Gi-Oh!',
      emoji: '🃏',
      descripcion:
        'Miles de cartas oficiales con ataque, defensa, atributo, tipo y la descripción completa de su efecto.',
      ruta: '/yu-gi-oh',
      dominio: 'db.ygoprodeck.com',
      caracteristicas: ['Búsqueda de cartas', 'ATK / DEF', 'Atributos'],
      color: '#8b5cf6',
    },
  ];

  /** Sonido breve al abrir una tarjeta */
  clicTarjeta(): void {
    this.audio.play('tarjeta');
  }
}
