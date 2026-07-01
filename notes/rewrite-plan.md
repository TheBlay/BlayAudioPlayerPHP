# Rewriting Plan for BlayAudioPlayer

## Goal
Refactor the current application into a cleaner, more maintainable structure while preserving the core functionality: upload, metadata handling, library listing, removal, playback, and offline persistence.

## Proposed Phases

### Phase 1 — Analysis and Scope Definition
Deliverables:
- list of core features to preserve
- current system flow map
- functional requirements summary
- non-functional requirements summary (performance, offline support, maintainability)

Activities:
- identify current user journeys
- map frontend/backend interactions
- list current pain points and risks
- define the target scope for the rewrite

### Phase 2 — Target Architecture Definition
Deliverables:
- proposed architecture diagram or structure description
- module responsibilities
- API contract definitions
- data model definition

Activities:
- separate UI, application, infrastructure, and persistence concerns
- define backend endpoints as thin controllers
- define service layer responsibilities
- define storage and metadata handling boundaries

### Phase 3 — Backend Refactor Foundation
Deliverables:
- cleaned PHP endpoint structure
- reusable helper/service classes
- database access abstraction
- upload and delete flows confirmed

Activities:
- isolate metadata extraction logic
- standardize responses for frontend consumption
- move business rules away from direct script logic where possible
- ensure uploads and removals are consistent and testable

### Phase 4 — Frontend Refactor Foundation
Deliverables:
- modular JavaScript structure
- reusable UI helpers
- storage abstraction for offline persistence
- clearer separation between UI and logic

Activities:
- move inline behaviors into modules
- centralize state and application events
- prepare the frontend for Dexie or IndexedDB integration
- keep the current UI experience intact while improving maintainability

### Phase 5 — Metadata and Offline Support
Deliverables:
- metadata extraction strategy
- offline persistence structure
- playlist/preferences handling flow

Activities:
- integrate metadata parsing from uploaded files
- centralize storage of playlists and preferences
- support offline restore and synchronization points

### Phase 6 — Migration and Validation
Deliverables:
- migrated feature set
- regression checklist
- validation evidence for upload, list, filter, remove, and playback scenarios

Activities:
- switch features gradually from the old implementation to the new one
- verify that each feature behaves correctly
- keep rollback points available during the transition

## Suggested Deliverables by Milestone

### Milestone 1: Current state documentation
- system map
- feature inventory
- known issues list

### Milestone 2: Architecture blueprint
- folder structure proposal
- component/service responsibilities
- API contract examples

### Milestone 3: Working backend core
- upload endpoint working
- delete endpoint working
- metadata extraction working

### Milestone 4: Working frontend core
- library list rendering
- filters working
- storage layer functional

### Milestone 5: Full rewrite validation
- end-to-end functionality verified
- offline behavior validated
- documentation updated

## Proposed Folder Structure

```text
BlayAudioPlayer/
├── index.php
├── manifest.json
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── controllers/
│   │   │   └── library-controller.js
│   │   ├── services/
│   │   │   ├── music-service.js
│   │   │   ├── storage-service.js
│   │   │   └── metadata-service.js
│   │   ├── models/
│   │   │   └── music-model.js
│   │   └── utils/
│   │       └── dom-utils.js
│   └── icons/
├── src/
│   ├── Application/
│   │   ├── LibraryService.php
│   │   ├── MetadataService.php
│   │   ├── UploadService.php
│   │   └── MusicRepository.php
│   ├── Domain/
│   │   ├── Music.php
│   │   ├── Album.php
│   │   ├── Tag.php
│   │   └── MusicStatus.php
│   ├── Infrastructure/
│   │   ├── Database/
│   │   │   └── DatabaseConnection.php
│   │   ├── Persistence/
│   │   │   └── MusicMapper.php
│   │   └── Storage/
│   │       └── FileStorage.php
├── public/
│   ├── api/
│   │   ├── upload.php
│   │   ├── remove.php
│   │   └── albums-tags.php
│   └── uploads/
│       ├── musicas/
│       └── capas/
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
│   └── rewrite-plan.md
└── notes/
    └── rewrite-plan.md
```

## Suggested Workflow

1. Document the current system behavior.
2. Define the target architecture and responsibilities.
3. Refactor backend services first.
4. Introduce frontend modules and abstractions.
5. Add offline persistence and metadata support.
6. Validate each feature before moving to the next.

## Recommended Implementation Order

1. upload flow
2. metadata extraction
3. library listing and filtering
4. remove flow
5. playlist/preferences persistence
6. offline support refinements

## Notes
- Keep the rewrite incremental rather than replacing everything at once.
- Preserve existing user-facing behavior while improving maintainability.
- Prefer small, verified changes over large risky rewrites.
