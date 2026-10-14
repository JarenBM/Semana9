import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiSelectorComponent } from './api-selector.component';

describe('ApiSelectorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiSelectorComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('debería crearse', () => {
    const fixture = TestBed.createComponent(ApiSelectorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería mostrar las 5 tarjetas con sus enlaces', () => {
    const fixture = TestBed.createComponent(ApiSelectorComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('a.api-card').length).toBe(5);

    const texto = el.textContent ?? '';
    for (const nombre of ['Pokédex', 'Los Simpson', 'Rick y Morty', 'Digimon', 'Yu-Gi-Oh!']) {
      expect(texto).toContain(nombre);
    }

    const enlaces = Array.from(el.querySelectorAll('a.api-card')).map((a) =>
      a.getAttribute('href'),
    );
    expect(enlaces).toContain('/pokemon');
    expect(enlaces).toContain('/simpson');
    expect(enlaces).toContain('/rick-morty');
    expect(enlaces).toContain('/digimon');
    expect(enlaces).toContain('/yu-gi-oh');
  });
});
