# SDD.md

# Developer's Workspace
### Software Design Document

Version: 1.0

Status: Active

Project Type:
Interactive First-Person 3D Portfolio

---

# 1. Project Vision

Developer's Workspace is an immersive 3D portfolio that presents the professional journey of Benjie Maybuena through environmental storytelling.

Instead of browsing webpages, visitors explore a software engineer's workspace where every object represents a part of his career.

The environment should feel believable, interactive, polished, and memorable.

The visitor should leave remembering the experience rather than remembering they visited a website.

---

# 2. Objectives

The project aims to:

• Showcase technical ability

• Demonstrate software engineering skills

• Display projects naturally

• Tell a professional story

• Highlight architectural thinking

• Impress recruiters

• Impress engineers

• Demonstrate frontend engineering capability

• Remain lightweight

• Remain mobile friendly

---

# 3. User Experience Philosophy

The user should never feel like they are clicking through menus.

Instead they should:

Walk

Look

Explore

Inspect

Interact

Discover

The room tells the story.

---

# 4. Target Audience

Primary

• Recruiters

• Technical Interviewers

• Engineering Managers

Secondary

• Developers

• Clients

• Friends

---

# 5. Story

The visitor arrives at a software engineer's apartment during the evening.

Rain falls outside.

The workspace is illuminated by monitor lights.

The computer is still running.

Someone has clearly been coding.

The room itself becomes the portfolio.

---

# 6. User Journey

Loading Screen

↓

Environment Loads

↓

Intro Camera

↓

Door Opens

↓

Player Enters

↓

Workspace

↓

Explore Objects

↓

Learn About Benjie

↓

View Projects

↓

Read Experience

↓

Inspect Achievements

↓

Contact

↓

Exit

---

# 7. Environment Layout

Main Entrance

↓

Workspace

↓

Library

↓

Project Wall

↓

Server Corner

↓

Coffee Area

↓

Certificate Wall

↓

Window

↓

Secret Lab

Each section has one responsibility.

---

# 8. Scene Layout

Entrance

Purpose

Introduction

Workspace

Purpose

Personal Profile

Triple Monitor

Purpose

Projects

Bookshelf

Purpose

Career Timeline

Whiteboard

Purpose

Goals

Server Rack

Purpose

Technical Skills

Coffee Table

Purpose

Personal Interests

Wall

Purpose

Education

Secret Lab

Purpose

Experimental Projects

---

# 9. Information Mapping

Computer

↓

Profile

VS Code

↓

Projects

Terminal

↓

Skills

Bookshelf

↓

Timeline

Whiteboard

↓

Experience

Certificates

↓

Education

Server Rack

↓

Architecture

Coffee Mug

↓

Personal Interests

Window

↓

Future Goals

---

# 10. Information Architecture

No content is embedded in the scene.

Every object references JSON.

Scene

↓

Object

↓

Reference Key

↓

JSON

↓

UI Renderer

---

# 11. Data Flow

Application Starts

↓

Load Settings

↓

Load Assets

↓

Load JSON

↓

Initialize Scene

↓

Attach Interactions

↓

Begin Rendering

---

# 12. Data Source

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

---

# 13. Scene Graph

Root

├── Environment

├── Player

├── Camera

├── Audio

├── Lighting

├── Objects

│

├── Desk

├── Monitors

├── Bookshelf

├── Coffee Table

├── Whiteboard

├── Server Rack

├── Certificates

├── Decorations

└── UI

---

# 14. Camera System

States

Intro

Walk

Focus

Inspect

Return

Every transition uses interpolation.

Never snap instantly.

---

# 15. Player Controls

Desktop

WASD

Mouse Look

Interaction Key

Escape Menu

Mobile

Virtual Joystick

Touch Look

Tap Interaction

Tablet

Hybrid Mode

---

# 16. Interaction System

Every object implements

Hover

Focus

Interact

Animation

Information

Close

Interaction must always return to exploration mode.

---

# 17. Interaction Flow

Player Looks

↓

Raycast

↓

Object Found

↓

Highlight

↓

Interact

↓

Play Animation

↓

Show Information

↓

Close

↓

Resume Exploration

---

# 18. Animation Philosophy

Animations should communicate meaning.

Examples

Monitor boots

Books slide

Drawer opens

Chair rotates

Terminal types

Certificates illuminate

Never animate without purpose.

---

# 19. Lighting

Primary

Monitor Glow

Secondary

Desk Lamp

Environment

Moonlight

Accent

RGB

Effects

Bloom

Ambient Occlusion

Reflection

Performance has priority over realism.

---

# 20. Audio

Ambient

Rain

PC Fan

Air Conditioner

Room Tone

Interactive

Keyboard

Mouse

Drawer

Book

Door

Coffee Mug

No intrusive background music.

---

# 21. Portfolio Sections

Profile

Projects

Experience

Timeline

Education

Technical Skills

Architecture

Achievements

Contact

Future

---

# 22. Project Viewer

Projects are not displayed as cards.

Instead

Open VS Code

↓

Select Folder

↓

Preview

↓

Description

↓

Technology

↓

Challenges

↓

Outcome

---

# 23. Timeline

Books represent years.

Pulling a book reveals

Position

Company

Responsibilities

Technologies

Achievements

---

# 24. Skills

Represented by

Server Rack

Network Diagram

Terminal

Not progress bars.

---

# 25. Education

Displayed through

Certificates

Diplomas

Awards

Interactive lighting

---

# 26. Contact

Computer Desktop

Contains

Email

GitHub

Portfolio

LinkedIn

Resume Download

No unnecessary information.

---

# 27. Hidden Room

Unlockable.

Contains

Experimental Work

Three.js

AI

Graphics

Future Concepts

Purpose

Reward exploration.

---

# 28. UI Philosophy

UI should appear only when needed.

Preferred

Terminal

Monitor

Hologram

Projection

Avoid floating panels.

---

# 29. JSON Architecture

Renderer

↓

Reads JSON

↓

Creates Components

↓

Displays Information

JSON never controls rendering logic.

---

# 30. Asset Pipeline

Blender

↓

GLB

↓

Compression

↓

Optimization

↓

Import

↓

Three.js

---

# 31. Performance

Goals

Desktop

60 FPS

Mobile

30 FPS+

Optimization

Lazy Loading

Texture Compression

LOD

Instancing

Draco

KTX2

Frustum Culling

Object Pooling

---

# 32. Mobile Strategy

Do not recreate the desktop experience.

Adapt it.

Desktop

Movement

Mobile

Guided Navigation

Desktop

Mouse

Mobile

Touch

Desktop

Keyboard

Mobile

Virtual Controls

---

# 33. Accessibility

Keyboard Navigation

Reduced Motion

Readable Fonts

Responsive Layout

Large Touch Targets

Screen Reader Friendly UI

---

# 34. Folder Architecture

src

engine

scene

components

systems

ui

animations

audio

interactions

loaders

utils

assets

models

textures

audio

hdr

fonts

data

public

---

# 35. Development Milestones

Milestone 1

Project Setup

Milestone 2

Rendering Engine

Milestone 3

Scene Construction

Milestone 4

Player Controller

Milestone 5

Interaction System

Milestone 6

Portfolio Data Layer

Milestone 7

UI

Milestone 8

Animations

Milestone 9

Audio

Milestone 10

Mobile Support

Milestone 11

Optimization

Milestone 12

Release Candidate

---

# 36. Future Expansion

Support

Multiple Rooms

Localization

Themes

Dynamic Weather

AI Assistant

Voice Commands

VR

Analytics

Additional Projects

Without major architectural changes.

---

# 37. Success Criteria

The project is successful if visitors:

Understand Benjie's technical capabilities.

Remember the experience.

Can easily navigate.

Can view it on desktop and mobile.

Experience smooth interactions.

Can discover every section naturally.

Finish exploring without confusion.

---

# 38. Design Principles

Every object has meaning.

Every interaction tells a story.

Every animation has purpose.

Every line of code supports maintainability.

Data remains separate from presentation.

Performance is always considered.

The room is the portfolio.

The portfolio is the experience.

---

# End of Document

Document Version

1.0

Status

Approved

Related Documents

AGENTS.md

PROJECT_GUIDE.md

README.md

DATA/*.json