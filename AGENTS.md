# AGENTS.md

## Stack
- Angular 22 + TypeScript 6, standalone components (no NgModules — use the `imports` array in `@Component`).
- SSR enabled (`outputMode: "server"` in `angular.json`); server entry is `src/server.ts` (Express 5, listens on `PORT` or 4000).
- Prerendering on via `RenderMode.Prerender` in `src/app/app.routes.server.ts`.

## Commands
- Dev: `ng serve` → http://localhost:4200
- Build: `ng build`
- Test: `ng test` (Vitest runner — **not** Karma/Jasmine)
- Serve SSR: `npm run build && npm run serve:ssr:Semana9`
- Format: `npx prettier --write .` (printWidth 100, single quotes for TS)

**No `lint` script exists** — only Prettier. Don't try `npm run lint`.

## Estructura del proyecto
- Patrón **componente-servicio**: la lógica de negocio vive en servicios, los componentes solo orquestan y renderizan.
- Todas las interfaces van en `interfaces/` (carpeta a nivel de `src/app` o `src`, según el alcance).
- En los componentes, el HTML siempre va en un archivo separado (`templateUrl`), nunca inline en el TS.

## Gotchas
- Test runner is Vitest, so tests use Vitest globals (`describe`, `it`, `expect`) — available via `vitest/globals` in `tsconfig.spec.ts`.
- Rutas en `src/app/app.routes.ts`: raíz → `ApiSelectorComponent` (selector con tarjetas); páginas: `/pokemon`, `/simpson`, `/rick-morty`, `/digimon`, `/yu-gi-oh`; `**` → redirect.
- En templates, las signals SIEMPRE se leen con paréntesis (` searchTerm()`); `[(ngModel)]` no funciona con signals — usar `[ngModel]="senal()" (ngModelChange)="senal.set($event)"`.
- APIs externas verificadas con CORS `*`: PokeAPI, thesimpsonsapi.com (sin búsqueda server-side, solo paginación), rickandmortyapi.com (404 = sin resultados), digimon-api.vercel.app (lista completa en una petición), db.ygoprodeck.com (400 = sin resultados).
- Production budgets: initial ≤500 kB (warn) / ≤1 MB (error); component styles ≤8 kB (warn) / ≤16 kB (error).
- `ng build` prerenderiza las 5 rutas y hace llamadas reales a las APIs — requiere red; si falla, degrada a lista vacía (los servicios usan `catchError`) pero el build no falla.
- `tsconfig.json` sets `module: "preserve"` and `target: ES2022` — leave as-is unless you know why you're changing it.
