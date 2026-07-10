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

This is an excellent architecture for a high-performance, local-first audio player. By combining Dexie.js for structured metadata, Blobs for storage, and Howler.js for audio lifecycle management, you bypass network latency entirely.
Here are the specific UI best practices and clean code strategies for your vanilla JS/CSS audio player stack:
🛠️ DB Schema & Clean Architecture
To handle the many-to-many relationship for tags cleanly without a heavy framework, structure your Dexie.js database to leverage index arrays.

// db.js - Database initialization
import Dexie from 'dexie';

export const db = new Dexie('AudioPlayerDB');

// Define schema. Multi-entry index (*) allows efficient tag querying.
db.version(1).stores({
  audios: '++id, title, artist, album, *tags', 
  tags: '++id, &name' // Unique tag names
});


High-Utility Querying (Intersection Filter)
To filter audios that contain both #german and #classic using clean vanilla JS:

// queries.js
export async function getAudiosByTags(selectedTags) {
  if (selectedTags.length === 0) return await db.audios.toArray();
  
  // Fetch collections for each tag in parallel
  const collections = await Promise.all(
    selectedTags.map(tag => db.audios.where('tags').equals(tag).toArray())
  );
  
  // Intersect arrays to find audios matching ALL selected tags
  return collections.reduce((accumulator, currentList) => {
    return accumulator.filter(audio => currentList.some(item => item.id === audio.id));
  });
}


🧠 Memory & Lifecycle Management (Clean Code)
Using URL.createObjectURL(blob) is efficient, but failing to revoke them causes massive memory leaks—especially with large audio files. [1, 2]

// player.js - Audio lifecycle manager
export class AudioPlaybackManager {
  constructor() {
    this.currentSound = null;
    this.currentObjectUrl = null;
  }

  async playAudio(audioId) {
    // 1. Clean up previous track memory immediately
    this.cleanup();

    // 2. Fetch Blob from Dexie
    const audioData = await db.audios.get(audioId);
    if (!audioData) throw new Error("Audio not found");

    // 3. Create fresh Object URL
    this.currentObjectUrl = URL.createObjectURL(audioData.blob);

    // 4. Initialize Howler
    this.currentSound = new Howl({
      src: [this.currentObjectUrl],
      format: [audioData.format || 'mp3'],
      html5: true, // Forces HTML5 Audio, critical for large blob performance
      onend: () => this.handleTrackEnd()
    });

    this.currentSound.play();
  }

  cleanup() {
    if (this.currentSound) {
      this.currentSound.unload(); // Stops playback and destroys Howler instance
      this.currentSound = null;
    }
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl); // Frees browser memory
      this.currentObjectUrl = null;
    }
  }
}


🎨 PWA UI/UX Best Practices for Audio
Media Session API Integration: This is vital for PWAs. It connects your vanilla JS player to the operating system's native lock screen and notification media controls.
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: audioData.title,
    artist: audioData.artist,
    album: audioData.album,
    artwork: [{ src: audioData.coverArtUrl || 'default-cover.png', sizes: '512x512', type: 'image/png' }]
  });

  // Wire up hardware/OS buttons
  navigator.mediaSession.setActionHandler('play', () => myPlayer.play());
  navigator.mediaSession.setActionHandler('pause', () => myPlayer.pause());
}
[3, 4]
Web Workers for FFmpeg: Processing audio compression/normalization via FFmpeg.wasm is CPU-intensive. Wrap FFmpeg operations inside a Web Worker so the UI thread remains locked at a buttery-smooth 60fps during imports.
Optimistic UI for Tagging: When a user toggles a tag on a song, update the UI element state instantly before the Dexie .put() promise resolves. If the DB write fails, revert the UI state with a toast notification.
Persistent Storage Request: PWAs can have their client-side storage cleared by the OS if the device runs low on disk space. Since you are storing heavy audio blobs locally, prompt the user for persistent storage permission early:
if (navigator.storage && navigator.storage.persist) {
  const isPersisted = await navigator.storage.persist();
  console.log(`Storage persisted: ${isPersisted}`);
}


📁 Vanillajs UI Component Architecture
Since you aren't using a framework, organize your UI using Event Delegation attached to an App Shell component. This prevents attaching thousands of event listeners to playlist rows, which degrades performance.

// ui.js - Handling tag filtering UI cleanly
const tagContainer = document.getElementById('tag-filters');
let activeTags = [];

tagContainer.addEventListener('click', async (event) => {
  const tagButton = event.target.closest('.tag-btn');
  if (!tagButton) return;

  const tagName = tagButton.dataset.tagName;
  
  // Toggle tag logic
  if (activeTags.includes(tagName)) {
    activeTags = activeTags.filter(t => t !== tagName);
    tagButton.classList.remove('active');
  } else {
    activeTags.push(tagName);
    tagButton.classList.add('active');
  }

  // Fetch and re-render playlist view
  const filteredAudios = await getAudiosByTags(activeTags);
  renderPlaylist(filteredAudios);
});


Would you like assistance with writing the Web Worker script for FFmpeg audio processing to keep your UI non-blocking, or should we focus on the CSS styling structures for the bottom audio controls dock?

[1] https://github.com
[2] https://medium.com
[3] https://www.flaming.codes
[4] https://caniuse.com
