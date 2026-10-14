import { Routes } from '@angular/router';
import { ApiSelectorComponent } from './components/api-selector/api-selector.component';
import { PokedexComponent } from './components/pokedex/pokedex.component';
import { SimpsonComponent } from './components/simpson/simpson.component';
import { RickMortyComponent } from './components/rick-morty/rick-morty.component';
import { DigimonComponent } from './components/digimon/digimon.component';
import { YuGiOhComponent } from './components/yu-gi-oh/yu-gi-oh.component';

export const routes: Routes = [
  { path: '', title: 'Inicio · Selector de APIs', component: ApiSelectorComponent },
  { path: 'pokemon', title: 'Pokédex · Semana9', component: PokedexComponent },
  { path: 'simpson', title: 'Los Simpson · Semana9', component: SimpsonComponent },
  { path: 'rick-morty', title: 'Rick y Morty · Semana9', component: RickMortyComponent },
  { path: 'digimon', title: 'Digimon · Semana9', component: DigimonComponent },
  { path: 'yu-gi-oh', title: 'Yu-Gi-Oh! · Semana9', component: YuGiOhComponent },
  { path: '**', redirectTo: '' },
];
