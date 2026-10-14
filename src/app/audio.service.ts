import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audioContext: AudioContext | null = null;

  constructor() {
    // window no existe durante el prerender del SSR
    if (typeof window === 'undefined') return;
    try {
      this.audioContext = new (window.AudioContext ?? (window as any).webkitAudioContext)();
    } catch {
      console.warn('AudioContext no disponible');
    }
  }

  /** Reproduce un archivo de audio externo (cry real de PokeAPI) */
  playFromUrl(url: string): void {
    new Audio(url).play().catch((err) => console.error('Error playing audio:', err));
  }

  /** Reproduce un "cry" sintético basado en el nombre del Pokémon */
  play(name: string): void {
    if (!this.audioContext) return;
    const { oscillator, gain } = this.createNodes();
    oscillator.frequency.value = (this.hashToFrequency(name) % 1000) + 200;
    oscillator.type = 'sine';
    gain.gain.value = 0.3;
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  /** Beep corto de respaldo */
  beep(): void {
    if (!this.audioContext) return;
    const { oscillator, gain } = this.createNodes();
    oscillator.frequency.value = 440;
    oscillator.type = 'square';
    gain.gain.value = 0.1;
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  private createNodes(): { oscillator: OscillatorNode; gain: GainNode } {
    const oscillator = this.audioContext!.createOscillator();
    const gain = this.audioContext!.createGain();
    oscillator.connect(gain);
    gain.connect(this.audioContext!.destination);
    return { oscillator, gain };
  }

  /** Hash simple del string a una frecuencia audible */
  private hashToFrequency(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 8000) + 100;
  }
}
