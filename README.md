## GitHub Mood

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38b2ac)
![Status](https://img.shields.io/badge/Status-WIP-f59e0b)

Un proyecto pequeño para visualizar tu estado de ánimo a partir del análisis de los commits en tus repositorios públicos de GitHub.

Solo ingresas tu `username` de GitHub y en segundos descubres:

- Tipo de dev (The Midnight Debugger, The Chaos Gremlin, The Clean Coder...).
- Tu estado emocional mes a mes a lo largo del último año.
- Tus commits más felices y más dramáticos.
- Estadísticas curiosas: hora pico, día más activo, mejor y peor repo.

No requiere autenticación. Solo usa la API pública de GitHub.



## Stack

- Next.js 16 — App Router, SSR.
- Recharts — Gráfica de mood timeline.
- `sentiment` (npm) — Análisis de sentimiento sin API externa.
- Tailwind CSS — Estilos.
- CubePath — Deploy y hosting.

## Instalación

1.- Clona el repo en local

```bash
git clone https://github.com/anchundiatech/gitmood.git

```
2.- Abre el repo con:

```bash
cd gitmood
```

3.- Instala dependiencia con tu empaquetador favorito

```bash
pnpm install
```

## Desarrollo

```bash
pnpm run dev
```

Luego abre `http://localhost:3000`.

## Build

```bash
pnpm run build
pnpm run start
```

## Contribuciones

PRs y issues son bienvenidos. Para cambios grandes, abre un issue primero para discutir el alcance.

Paso a paso:

1. Haz un fork del repo.
2. Crea una rama nueva: `git checkout -b feature/tu-cambio`.
3. Instala dependencias: `pnpm install`.
4. Corre el proyecto en local: `pnpm run dev`.
5. Haz tus cambios con commits claros.
6. Abre un Pull Request describiendo el cambio y el contexto.
