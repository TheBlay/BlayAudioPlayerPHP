# Architecture Blueprint for a Fresh Build

## Purpose
This document outlines a clean, maintainable, and scalable structure for a browser-first audio player application that supports local file import, metadata extraction, playback, offline persistence, and installability.

## Architectural Principles
- Keep the app browser-first rather than server-upload-first.
- Separate responsibilities into clear layers.
- Favor simple modules over complex object-oriented abstractions.
- Keep the core flow understandable for future maintenance and scaling.
- Preserve the current app experience while making the architecture easier to evolve.

---

## Suggested Layers

### 1. Presentation Layer
Responsible for UI rendering and user interaction.

Modules:
- app-shell
- library-view
- player-view
- upload-view
- navigation-controller
- toast/notification UI

### 2. Application Layer
Responsible for orchestrating use cases and business rules.

Modules:
- import-usecase
- library-management-usecase
- playback-usecase
- queue-management-usecase
- install-usecase

### 3. Domain Layer
Responsible for the core concepts of the product.

Modules:
- track-model
- playlist-model
- library-state
- metadata-model

### 4. Infrastructure Layer
Responsible for browser APIs and external integrations.

Modules:
- file-system-access-service
- indexeddb-repository
- media-session-service
- drag-and-drop-service
- pwa-install-service
- metadata-extraction-service
- audio-player-service

### 5. Shared Utilities
Responsible for reusable helpers.

Modules:
- dom-utils
- format-utils
- storage-helpers
- event-bus
- logger

---

## Suggested Module Breakdown

### Keep from the current project
These parts are still valid as a foundation:
- UI structure and current views
- player interface concept
- playlist concept
- manifest/PWA idea
- IndexedDB storage concept
- basic metadata parsing idea

### New parts to add
These are required for the new scope:
- local file import module
- directory import module
- structured library store
- metadata extraction service
- Media Session integration
- install prompt handling
- drag-and-drop queueing logic
- offline-first library synchronization logic

---

## Suggested File Structure

```text
BlayAudioPlayer/
├── index.html
├── manifest.json
├── service-worker.js
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── icons/
│   └── js/
│       ├── main.js
│       ├── app.js
│       ├── bootstrap.js
│       │
│       ├── presentation/
│       │   ├── views/
│       │   │   ├── player-view.js
│       │   │   ├── library-view.js
│       │   │   └── upload-view.js
│       │   ├── components/
│       │   │   ├── player-controls.js
│       │   │   ├── track-list.js
│       │   │   └── status-banner.js
│       │   └── controllers/
│       │       ├── navigation-controller.js
│       │       └── ui-controller.js
│       │
│       ├── application/
│       │   ├── import-usecase.js
│       │   ├── playback-usecase.js
│       │   ├── library-usecase.js
│       │   ├── queue-usecase.js
│       │   └── install-usecase.js
│       │
│       ├── domain/
│       │   ├── track-model.js
│       │   ├── playlist-model.js
│       │   ├── library-state.js
│       │   └── metadata-model.js
│       │
│       ├── infrastructure/
│       │   ├── file-system-access-service.js
│       │   ├── metadata-extraction-service.js
│       │   ├── indexeddb-repository.js
│       │   ├── audio-player-service.js
│       │   ├── media-session-service.js
│       │   ├── drag-and-drop-service.js
│       │   └── install-prompt-service.js
│       │
│       └── shared/
│           ├── dom-utils.js
│           ├── format-utils.js
│           ├── storage-helpers.js
│           ├── event-bus.js
│           └── logger.js
│
├── data/
│   └── sample-library.json
│
├── docs/
│   ├── architecture-blueprint.md
│   └── requirements.md
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Suggested Responsibility Split

### Presentation
- renders the UI
- binds events to buttons and views
- displays status and messages
- does not contain database or file system logic

### Application
- coordinates the workflow for importing files
- decides when metadata should be stored
- manages queue and playback decisions
- triggers install behavior when appropriate

### Infrastructure
- interacts with browser APIs such as File System Access, IndexedDB, Media Session, and drag-and-drop
- isolates third-party or browser-specific behavior

### Domain
- defines the data models used across the app
- keeps track of the library and current playback state

---

## Suggested Implementation Strategy

### Phase 1 — Foundation
- create the module folders
- define basic bootstrapping and shared utilities
- set up the app shell and routing between views

### Phase 2 — Local Import
- add file and directory selection support
- create the import workflow and initial metadata capture

### Phase 3 — Persistence
- create the IndexedDB repository
- save imported tracks and metadata

### Phase 4 — Playback and Queue
- build playback state and dynamic queue logic
- support drag-and-drop queueing

### Phase 5 — Enhancements
- add Media Session integration
- add install prompt handling
- add offline-friendly behaviors

---

## Notes for Maintainability
- Keep each module focused on one responsibility.
- Use small functions and clear names.
- Avoid mixing DOM manipulation, file import logic, and persistence in a single file.
- Prefer a simple event-driven structure over tightly coupled code.
- Keep the architecture modular so each requirement can evolve independently.
