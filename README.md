# Developer's Workspace

> **An immersive first-person 3D portfolio that tells the story of a software engineer through exploration, interaction, and environmental storytelling.**

---

## Overview

Developer's Workspace is a modern, interactive portfolio designed to replace the traditional resume website with a fully immersive experience.

Instead of navigating pages, visitors explore a programmer's workspace where every object represents a part of the developer's career.

The project is designed to demonstrate not only professional experience, but also software engineering principles, architecture, frontend development, UI/UX, performance optimization, and 3D graphics.

This repository is intentionally built as a **frontend-only application**, ensuring it can be deployed anywhere as a static website without requiring any backend services.

---

# Project Goals

- Build an unforgettable portfolio experience.
- Showcase software engineering skills through interaction.
- Highlight professional experience naturally.
- Maintain excellent performance across desktop and mobile devices.
- Keep the project fully data-driven.
- Separate content from presentation.
- Allow AI coding agents to contribute with minimal supervision.
- Create a maintainable, scalable, and extensible architecture.

---

# Key Features

## Immersive 3D Environment

Explore a fully interactive programmer's workspace built using modern web technologies.

---

## Environmental Storytelling

Instead of traditional navigation menus, visitors discover information by interacting with objects throughout the room.

Examples include:

- Computer workstation
- Triple-monitor setup
- Bookshelf
- Whiteboard
- Server rack
- Certificates
- Coffee table
- Secret laboratory

---

## Data-Driven Portfolio

All portfolio content is stored as structured JSON.

No personal information is hardcoded into the application.

This allows the renderer to remain independent from the data source.

---

## Interactive Objects

Each interactive object includes:

- Hover state
- Focus animation
- Camera transition
- Information renderer
- Exit animation

---

## Mobile Friendly

The project is designed with responsive interactions.

Desktop

- WASD Movement
- Mouse Look

Tablet

- Hybrid Controls

Mobile

- Touch Navigation
- Virtual Joystick
- Tap Interactions

---

## Performance Focused

The project prioritizes performance by utilizing:

- Lazy Loading
- GLB Models
- Texture Compression
- Frustum Culling
- Level of Detail (LOD)
- Asset Optimization
- Efficient Scene Management

---

# Technology Stack

## Core

- TypeScript
- Vite
- Three.js

## Animation

- GSAP

## 3D

- Blender
- GLTF
- DRACO Compression
- KTX2 Compression

## Rendering

- Effect Composer
- Bloom
- Ambient Occlusion
- HDR Environment Maps

---

# Project Structure

```
portfolio/

│

├── AGENTS.md

├── PROJECT_GUIDE.md

├── SDD.md

├── README.md

│

├── data/

│   ├── profile.json

│   ├── projects.json

│   ├── experience.json

│   ├── education.json

│   ├── timeline.json

│   ├── skills.json

│   ├── contact.json

│   ├── settings.json

│   ├── world-map.json

│   └── objects.json

│

├── assets/

│   ├── models/

│   ├── textures/

│   ├── audio/

│   ├── fonts/

│   └── hdr/

│

├── src/

│   ├── engine/

│   ├── scene/

│   ├── systems/

│   ├── interactions/

│   ├── ui/

│   ├── animations/

│   ├── audio/

│   ├── loaders/

│   └── utils/

│

└── public/
```

---

# Development Principles

The project follows several important principles.

## 1. Data First

Content lives inside JSON files.

Rendering logic should never contain portfolio information.

---

## 2. Separation of Concerns

Data

↓

Renderer

↓

Interaction

↓

Animation

↓

Presentation

---

## 3. Performance First

Every feature should be evaluated for its impact on performance before implementation.

Maintain smooth rendering across supported devices.

---

## 4. Reusability

Components should be generic.

Objects should be configurable.

Interactions should be reusable.

---

## 5. Maintainability

Small modules.

Clear responsibilities.

Minimal dependencies.

Readable code.

---

# Documentation

This repository uses several documentation files.

| File | Purpose |
|------|---------|
| AGENTS.md | AI development instructions |
| SDD.md | Software Design Document |
| README.md | Project overview |
| data/*.json | Portfolio content |

---

# Portfolio Architecture

Every interactive object references structured data.

```
Player

↓

Object

↓

Reference Key

↓

JSON

↓

Renderer

↓

Animation

↓

Information
```

No object owns portfolio content.

---

# Installation

Clone the repository.

```bash
git clone <repository-url>
```

Install dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

Build for production.

```bash
npm run build
```

Preview production build.

```bash
npm run preview
```

---

# Development Workflow

1.

Update JSON data.

↓

2.

Create scene object.

↓

3.

Bind interaction.

↓

4.

Attach animation.

↓

5.

Test desktop.

↓

6.

Test mobile.

↓

7.

Optimize.

↓

8.

Commit.

---

# Coding Standards

Refer to:

```
AGENTS.md
```

All contributors should follow the coding standards defined in that document.

---

# Software Design

Refer to:

```
SDD.md
```

This document defines the architecture and overall design philosophy.

---

# Future Roadmap

Planned features include:

- AI-powered terminal assistant
- Dynamic weather
- Day/Night cycle
- Voice interaction
- Additional environments
- Multiple portfolio themes
- Localization
- VR support
- Multiplayer workspace exploration
- Analytics (optional)

---

# Deployment

The application is designed to run as a static website.

Recommended hosting providers include:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

No backend infrastructure is required.

---

# License

This project is intended to serve as the personal portfolio of **Benjie Maybuena**.

Unauthorized redistribution or commercial reuse of the portfolio content, branding, or personal assets is prohibited unless explicitly permitted by the repository owner.

Third-party libraries remain subject to their respective licenses.

---

# Acknowledgements

Built with modern web technologies and inspired by the idea that a portfolio should demonstrate engineering ability through experience—not just describe it.

---

# Project Motto

> **"Don't tell people you're a software engineer. Let them experience how you think."**