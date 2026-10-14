import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { YuGiOhService } from '../../yu-gi-oh.service';
import { YugiohCard } from '../../interfaces/yu-gi-oh.interface';

@Component({
  selector: 'app-yu-gi-oh',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './yu-gi-oh.component.html',
  styleUrls: ['./yu-gi-oh.component.css'],
})
export class YuGiOhComponent {
  private readonly yuGiOhService = inject(YuGiOhService);

  consulta = signal('');
  cartas = signal<YugiohCard[]>([]);
  consulto = signal(false);
  cargando = signal(false);
  error = signal('');
  aviso = signal('');

  buscar(): void {
    const texto = this.consulta().trim();
    if (texto.length < 2) {
      this.aviso.set('Escribe al menos 2 caracteres para buscar cartas.');
      return;
    }
    this.aviso.set('');
    this.cargando.set(true);
    this.error.set('');
    this.yuGiOhService.searchCards(texto).subscribe({
      next: (cartas) => {
        this.cartas.set(cartas);
        this.consulto.set(true);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con la API de Yu-Gi-Oh!');
        this.cargando.set(false);
      },
    });
  }

  /** Imagen principal de la carta */
  imagen(c: YugiohCard): string {
    return c.card_images?.[0]?.image_url ?? '';
  }

  /** Nombre legible del tipo de carta */
  tipoLegible(c: YugiohCard): string {
    return c.humanReadableCardType ?? c.type;
  }
}
