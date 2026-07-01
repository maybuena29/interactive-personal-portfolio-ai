# AGENTS.md

Interactive 3D portfolio (Vite + TypeScript + Three.js + GSAP) for Benjie Maybuena. All content driven by JSON in `config/`.

## Setup

```bash
npm install
npm run dev        # dev server at :3000
npm run build      # typecheck + production build
npm run typecheck  # tsc --noEmit
```

Node 21.x is the minimum. Vite 5 is pinned for Node 21 compatibility.

## Project structure

```
src/engine/        Engine.ts (renderer, scene, camera, loop)
src/scene/         SceneManager.ts, ObjectFactory.ts
src/systems/       LightingSystem, EnvironmentManager, InteractionSystem, AIEngine, MobileInput
src/interactions/  (interaction state machine stubs)
src/ui/            UIManager.ts (all portfolio UI panels)
src/animations/    (GSAP animation system stubs)
src/audio/         AudioManager.ts
src/loaders/       ConfigLoader.ts, DataLoader.ts
src/utils/         (utility helpers)
```

Runtime config fetching: files under `public/config/` are served at `/config/`. A Vite plugin copies `config/` → `public/config/` on every build/dev start.

## Architecture rules

- **No hardcoded content** — every string comes from `config/data/*.json`
- **Runtime config loading** — JSON fetched via `ConfigLoader`, never imported at build time
- **Interaction lifecycle**: hover → focus → interact → animate → info → return
- **Camera**: smooth interpolation (no snapping), OrbitControls with damping
- **Controls**: OrbitControls (desktop/tablet), virtual joystick (mobile)
- **Performance targets**: 60 FPS desktop, 30+ FPS mobile

## Key data flows

- Object interaction: `config/world/objects.json` → `interaction.dataSource` → `config/data/*.json`
- Scene navigation: `config/world/world-map.json` areas → `connections[]` adjacency graph
- AI queries: keyword → `config/ai/query-map.json` → dataset lookup → `config/ai/prompt-context.json` response generation
- Cross-file relationships: `config/ai/portfolio.schema.json:24-31`
- Model paths: `environment/`, `props/`, `furniture/` subdirs under `assets/models/`

## Inconsistencies fixed

- `skills.json` referenced `"hotel101"` as project ID → corrected to `"hotel"` to match `projects.json`
- `world-map.json` referenced `headphones`, `career-frame`, `city-view`, `future-projects` not in `objects.json` → omitted from area object lists
