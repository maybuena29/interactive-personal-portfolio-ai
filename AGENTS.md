# AGENTS.md

Pre-implementation repo — no `package.json`, `src/`, or build config yet. All existing code is JSON data under `config/`.

## Setup (when starting implementation)

```bash
npm create vite@latest . -- --template vanilla-ts
npm install three gsap
npm run dev       # dev server
npm run build     # production build
```

## Additional Project Documentation

Before making any implementation decisions, read these documents completely:

- PROJECT_GUIDE.md
- SDD.md
- README.md

If these documents conflict, PROJECT_GUIDE.md takes precedence over inferred architecture.

## Config-driven architecture

Every portfolio string, scene object, and interaction is defined in `config/` — never hardcode.

```
config/
  data/           profile, projects, skills, experience, education, contact, settings, timelines
  world/          scene, objects, interactions, lighting, audio, world-map
  ai/             agent-rules, query-map, prompt-context, portfolio-schema
  data/maybuena-cv.pdf   source document (do not commit to src/)
```

### Key data patterns (verified from JSON)

- Object interaction flow: `config/world/objects.json` → `interaction.dataSource` → `config/data/*.json` key
- Scene area navigation: `config/world/world-map.json` areas → `connections[]` array defines the movement graph
- AI assistant query: keyword → `config/ai/query-map.json` lookup priority → dataset → `config/ai/prompt-context.json` response templates
- Model paths use subdirectories: `environment/`, `props/`, `furniture/` under `assets/models/`
- Data relationships in `config/ai/portfolio.schema.json:24-31` (foreign-key style cross-references between JSON files)

## Expected src/ layout

```
src/engine/  src/scene/  src/systems/  src/interactions/
src/ui/      src/animations/  src/audio/  src/loaders/  src/utils/
```

## Technology stack

Vite + TypeScript + Three.js + GSAP. Models from Blender as `.glb` (DRACO/KTX2 compressed). No backend — static-site deploy.

## Architecture constraints

- Config loaded at runtime (JSON fetched by renderer, not imported at build time)
- Camera: smooth interpolation, no snapping
- Every interactive object: hover → focus → interact → animate → info → return
- WASD+mouse (desktop), virtual joystick+touch (mobile), orbit (tablet fallback)
- Performance: 60 FPS desktop / 30-60 FPS mobile

## Existing docs (keep)

`AGENTS.md` > `PROJECT_GUIDE.md` > `SDD.md` > `README.md` > source code. The `config/ai/agent-rules.json` defines the in-portfolio AI assistant behavior.

## Inconsistencies fixed during implementation

- `skills.json` references `"hotel101"` as project ID — corrected to `"hotel"` to match `projects.json`
- `world-map.json` references `headphones`, `career-frame`, `city-view`, `future-projects` not in `objects.json` — omitted from area object lists```