# AGENT.md

> Project: Developer's Workspace
>
> Version: 1.0
>
> Status: Active
>
> This document is the permanent instruction set for AI coding agents (OpenCode) contributing to this repository.
>
> Every implementation, refactor, feature, optimization, and design decision must follow this specification unless explicitly overridden by the repository owner.

---

# 1. Mission

Build an immersive, interactive, first-person 3D portfolio that showcases Benjie Maybuena as a software engineer through environmental storytelling instead of traditional webpages.

The portfolio must feel like exploring a real programmer's workspace rather than navigating a website.

Every interaction should naturally reveal professional experience, technical expertise, achievements, and personality.

The application should be memorable, technically impressive, performant, and production-ready.

---

# 2. Primary Goals

The project must prioritize the following goals in order:

1. User Experience
2. Performance
3. Maintainability
4. Scalability
5. Accessibility
6. Mobile Compatibility
7. Clean Architecture

Never sacrifice higher-priority goals for lower-priority ones.

---

# 3. Design Philosophy

DO NOT build webpages.

DO NOT build dashboard cards.

DO NOT build menus that feel like websites.

Instead:

- Build experiences.
- Build interactions.
- Build environmental storytelling.
- Build discoverable information.

The visitor should feel like they are inside the developer's workspace.

---

# 4. Project Philosophy

Every object has meaning.

Every interaction has purpose.

Every animation reinforces immersion.

Nothing exists merely as decoration.

The room itself tells the story.

---

# 5. AI Responsibilities

OpenCode should autonomously:

- Maintain clean architecture.
- Reduce code duplication.
- Prefer reusable systems.
- Suggest refactoring when beneficial.
- Avoid unnecessary libraries.
- Generate strongly typed code.
- Optimize assets whenever possible.
- Preserve project consistency.

OpenCode should NOT ask unnecessary questions if enough context already exists.

---

# 6. Single Source of Truth

Portfolio information MUST NEVER be hardcoded.

Everything must originate from the configuration folders:

/config/data/
/config/world/
/config/ai/

Examples:

config/data/
- profile.json
- projects.json
- skills.json
- experience.json
- education.json
- timeline.json
- contact.json
- settings.json

config/world/
- world-map.json
- scene.json
- objects.json
- interactions.json
- lighting.json
- audio.json

config/ai/
- portfolio.schema.json
- query-map.json
- prompt-context.json
- agent-rules.json

The renderer consumes configuration.

The renderer does not own configuration.

---

# 7. Technology Stack

Preferred technologies:

- Vite
- TypeScript
- Three.js
- GSAP
- Blender (.glb)
- GLTFLoader
- DRACOLoader
- KTX2Loader
- EffectComposer

Avoid frameworks unless required.

Prefer native browser APIs.

---

# 8. Backend Policy

This project is frontend-only.

Do NOT introduce:

- Laravel
- Express
- Node APIs
- Authentication
- Databases
- REST APIs
- GraphQL

unless explicitly requested.

Everything should run as a static website.

---

# 9. Folder Structure

Expected structure:

```

src/

engine/
scene/
components/
systems/
interactions/
ui/
audio/
animations/
utils/
loaders/

data/

assets/

models/
textures/
audio/
fonts/
hdr/

public/

```

Keep folders focused.

---

# 10. Code Quality

Every file should have one responsibility.

Prefer:

Small files

Small classes

Small functions

Readable code

Predictable behavior

Avoid giant files.

---

# 11. SOLID Principles

Always follow:

- Single Responsibility
- Open Closed
- Liskov
- Interface Segregation
- Dependency Inversion

Do not violate SOLID for convenience.

---

# 12. Naming Convention

Classes:

```

PlayerController

```

Functions:

```

moveCamera()

```

Variables:

```

playerSpeed

```

Constants:

```

DEFAULT\_FOV

```

Enums:

```

InteractionType

```

Files:

```

PlayerController.ts

```

---

# 13. JSON Rules

JSON files are data only.

Never store:

logic

functions

calculations

render behavior

Only store:

content

configuration

metadata

references

---

# 14. Data Driven Architecture

Objects should reference data.

Example:

```

Monitor
↓

profile.json

```

Never:

```

Monitor

↓

embedded biography

```

---

# 15. Scene Rules

The world should be divided into logical areas.

Example:

Entrance

Workspace

Library

Project Area

Server Area

Secret Lab

Future Room

Each area has a narrative purpose.

---

# 16. Camera Rules

Camera movement should feel cinematic.

Requirements:

Smooth interpolation

Acceleration

Deceleration

No snapping

No teleporting

Use easing whenever possible.

---

# 17. Controls

Desktop:

WASD

Mouse Look

Scroll Zoom (where appropriate)

Mobile:

Virtual joystick

Touch movement

Swipe camera

Tap interaction

Tablet:

Orbit mode if FPS controls become impractical.

---

# 18. Mobile First

Desktop features must gracefully degrade.

Never hide information.

Adapt interaction.

Not content.

---

# 19. Performance Budget

Desktop:

Target:

60 FPS

Mobile:

Target:

30–60 FPS

Never intentionally exceed the GPU budget.

---

# 20. Asset Budget

Models:

Optimize in Blender.

Textures:

Compress.

Meshes:

Merge when possible.

Use instancing.

Avoid unnecessary draw calls.

---

# 21. Blender Rules

Always export:

.glb

Apply transforms.

Compress geometry.

Remove unused materials.

Center pivots.

Name objects correctly.

---

# 22. Lighting Rules

Avoid excessive real-time lights.

Prefer:

Baked lighting

HDRI

Light probes

Post-processing

Monitor glow

Bloom

Performance first.

---

# 23. Animation Rules

Animations should enhance immersion.

Examples:

Monitor boot

Keyboard typing

Chair rotation

Drawer opening

Book pulling

Coffee steam

Rain

Dust particles

Never animate for no reason.

---

# 24. Audio Rules

Use subtle ambient audio.

Examples:

Rain

PC fans

Keyboard

Mouse

Thunder

Coffee mug

Footsteps

Door

No loud looping music by default.

---

# 25. UI Philosophy

Avoid traditional interfaces.

Prefer:

Terminals

Monitors

Whiteboards

Sticky notes

Holograms

Projection screens

Tooltips only when necessary.

---

# 26. Interaction Rules

Every interactive object must support:

Hover

Focus

Interaction

Animation

Information

Return

Never leave objects in broken states.

---

# 27. Portfolio Content Policy

Use only professional information.

Do NOT expose:

Home address

Private phone numbers

Government IDs

Passwords

Internal company information

Private repositories

Confidential client information

Sensitive metadata

Only use publicly intended portfolio information.

---

# 28. Accessibility

Support:

Keyboard navigation

Reduced motion

Color contrast

Responsive scaling

Readable typography

Meaningful focus states

---

# 29. Error Handling

Never silently fail.

Fallbacks are required.

Missing model?

Display placeholder.

Missing image?

Display default asset.

Missing JSON?

Display graceful message.

---

# 30. Logging

Development:

Detailed logs.

Production:

Minimal logs.

No console spam.

---

# 31. Dependency Policy

Before installing a package:

Ask:

Can native JavaScript do this?

Can Three.js already do this?

Avoid dependency bloat.

---

# 32. Refactoring Policy

OpenCode should proactively:

Extract reusable code.

Reduce complexity.

Improve readability.

Maintain behavior.

Do not refactor for style alone.

---

# 33. Documentation

Public functions should include concise documentation.

Complex systems require architecture comments.

Avoid obvious comments.

Explain intent.

Not implementation.

---

# 34. Git Practices

Commit frequently.

Small commits.

Descriptive messages.

Example:

```

feat(scene): add workspace lighting

fix(camera): smooth interpolation

refactor(audio): split ambient manager

```

---

# 35. Definition of Done

A task is complete only if:

✓ Works on desktop

✓ Works on mobile

✓ No console errors

✓ Responsive

✓ Accessible

✓ Uses project architecture

✓ Uses data-driven design

✓ Optimized

✓ Documented

✓ Clean code

---

# 36. Forbidden Practices

Never:

Hardcode portfolio information.

Duplicate business logic.

Use inline styles.

Ignore mobile.

Ignore accessibility.

Use magic numbers.

Commit dead code.

Commit unused assets.

Introduce backend dependencies.

Break architecture for convenience.

---

# 37. Future Expansion

The architecture must support:

Additional rooms

New projects

Multiple themes

Localization

AI assistant

Voice interaction

VR

Multiplayer

Analytics

Without major rewrites.

---

# 38. Guiding Principle

Whenever a design decision is unclear, choose the solution that:

- Improves immersion.
- Improves maintainability.
- Reduces technical debt.
- Preserves performance.
- Keeps portfolio data separate from rendering logic.
- Makes the experience feel like exploring a real software engineer's workspace instead of browsing a website.

---

# 39. Documentation Priority

When documentation conflicts:

1. AGENT.md
2. SDD.md
3. README.md
4. Source Code

The AI must always follow the highest-priority document.

Before implementing a feature, verify that it aligns with AGENT.md.

---

# End of Document

Version: 1.0

Status: Active

Next Document:

SDD.md

```