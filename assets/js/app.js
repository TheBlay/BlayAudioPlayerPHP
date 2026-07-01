const navButtons = Array.from(document.querySelectorAll('.app-nav button'));
const views = Array.from(document.querySelectorAll('.view'));
const uploadForm = document.getElementById('upload-form');
const albumSelect = document.getElementById('album-select');
const albumNewInput = document.getElementById('album-new');
const tagsInput = document.getElementById('tags-input');
const tagHint = document.getElementById('tag-hint');
const uploadStatus = document.getElementById('upload-status');
const libraryStatus = document.getElementById('library-status');
const titleInput = uploadForm?.querySelector('input[name="titulo"]');
const artistInput = uploadForm?.querySelector('input[name="artista"]');
const audioFileInput = uploadForm?.querySelector('input[name="audio_file"]');

function switchView(viewId) {
  views.forEach(view => {
    view.classList.toggle('hidden', view.id !== viewId);
    view.classList.toggle('active', view.id === viewId);
  });
  navButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.view === viewId);
  });
}

function setupNavigation() {
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      switchView(button.dataset.view);
    });
  });
}

function showUploadStatus(text, isError = false) {
  if (!uploadStatus) return;
  uploadStatus.textContent = text;
  uploadStatus.style.color = isError ? '#ff9a9a' : '#9aa0ac';
}

function showLibraryStatus(text) {
  if (!libraryStatus) return;
  libraryStatus.textContent = text;
}

const filterAlbum = document.getElementById('filter-album');
const filterTag = document.getElementById('filter-tag');
const searchInput = document.getElementById('search-input');
const filterChipList = document.getElementById('filter-chip-list');

let availableAlbums = [];
let availableTags = [];
let activeFilters = {
  album: '',
  tag: '',
  search: ''
};

function loadAlbumsAndTags() {
  fetch('get_albums_tags.php')
    .then(response => response.json())
    .then(data => {
      if (!data) {
        return;
      }

      if (Array.isArray(data.albums)) {
        availableAlbums = [''].concat(data.albums.map(album => album.nome));
        filterAlbum.innerHTML = '<option value="">Todos os álbuns</option>';
        availableAlbums.slice(1).forEach(nome => {
          const option = document.createElement('option');
          option.value = nome;
          option.textContent = nome;
          filterAlbum.appendChild(option);
        });
      }

      if (Array.isArray(data.tags)) {
        availableTags = [''].concat(data.tags.map(tag => tag.nome));
        filterTag.innerHTML = '<option value="">Todas as tags</option>';
        availableTags.slice(1).forEach(nome => {
          const option = document.createElement('option');
          option.value = nome;
          option.textContent = nome;
          filterTag.appendChild(option);
        });
        const tagNames = data.tags.map(tag => tag.nome).join(' ');
        tagHint.textContent = tagNames ? `Tags existentes: ${tagNames}` : 'Tags existentes: nenhuma';
      }
    })
    .catch(error => {
      console.warn('Falha ao carregar álbuns e tags:', error);
    });
}

function uploadMusic(event) {
  event.preventDefault();

  const formData = new FormData(uploadForm);
  showUploadStatus('Enviando música...', false);

  fetch('upload_musica.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        showUploadStatus(`Erro: ${data.error}`, true);
        return;
      }

      showUploadStatus('Música enviada com sucesso!', false);
      uploadForm.reset();
      loadAlbumsAndTags();
      if (typeof window.refreshLibrary === 'function') {
        window.refreshLibrary();
      }
      if (typeof window.fetchAndSyncPlaylist === 'function') {
        window.fetchAndSyncPlaylist();
      }
    })
    .catch(error => {
      console.warn('Falha no upload:', error);
      showUploadStatus('Erro ao enviar música.', true);
    });
}

function parseAudioMetadata(file) {
  if (!file || typeof file.name !== 'string') {
    return;
  }

  const titleCandidate = file.name.replace(/\.[^/.]+$/, '').trim();
  const guessed = guessAudioFieldsFromName(titleCandidate);
  if (titleInput && !titleInput.value && guessed.title) {
    titleInput.value = guessed.title;
  }
  if (artistInput && !artistInput.value && guessed.artist) {
    artistInput.value = guessed.artist;
  }

  if (guessed.title && titleInput && !titleInput.value) {
    titleInput.value = guessed.title;
  }
  if (guessed.artist && artistInput && !artistInput.value) {
    artistInput.value = guessed.artist;
  }

  if (!file.name.toLowerCase().endsWith('.mp3')) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const buffer = reader.result;
    const tag = parseID3v1(buffer);
    if (!tag) {
      return;
    }

    if (tag.title && titleInput && !titleInput.value) {
      titleInput.value = tag.title;
    }
    if (tag.artist && artistInput && !artistInput.value) {
      artistInput.value = tag.artist;
    }
    if (tag.album) {
      const albumName = tag.album;
      const existingAlbum = Array.from(albumSelect?.options || []).find(option => option.value === albumName);
      if (existingAlbum && albumSelect) {
        albumSelect.value = albumName;
      } else if (albumNewInput) {
        albumNewInput.value = albumName;
      }
    }
  };
  reader.onerror = () => {
    console.warn('Falha ao ler metadados de áudio.');
  };
  const slice = file.slice(file.size - 128, file.size);
  reader.readAsArrayBuffer(slice);
}

function guessAudioFieldsFromName(filename) {
  const parts = filename.split(/\s*-\s*/);
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim()
    };
  }
  return { title: filename, artist: '' };
}

function parseID3v1(buffer) {
  if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < 128) {
    return null;
  }
  const view = new DataView(buffer);
  if (String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2)) !== 'TAG') {
    return null;
  }

  const readString = (offset, length) => {
    let text = '';
    for (let i = offset; i < offset + length; i += 1) {
      const char = view.getUint8(i);
      if (char === 0) break;
      text += String.fromCharCode(char);
    }
    return text.trim();
  };

  return {
    title: readString(3, 30),
    artist: readString(33, 30),
    album: readString(63, 30)
  };
}

function applyFilters() {
  activeFilters.album = filterAlbum?.value || '';
  activeFilters.tag = filterTag?.value || '';
  activeFilters.search = searchInput?.value.trim().toLowerCase() || '';
  renderLibraryTable();
  updateFilterChips();
}

function updateFilterChips() {
  if (!filterChipList) return;

  filterChipList.innerHTML = '';
  Object.entries(activeFilters).forEach(([key, value]) => {
    if (!value) return;

    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `${key === 'search' ? 'Buscar' : key.charAt(0).toUpperCase() + key.slice(1)}: ${value} <button type="button" data-key="${key}">&times;</button>`;
    filterChipList.appendChild(chip);
  });

  Array.from(filterChipList.querySelectorAll('button')).forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.key;
      if (!key) return;
      activeFilters[key] = '';
      if (key === 'search') {
        searchInput.value = '';
      } else if (key === 'album') {
        filterAlbum.value = '';
      } else if (key === 'tag') {
        filterTag.value = '';
      }
      applyFilters();
    });
  });
}

function filterMusicList(list) {
  return list.filter(music => {
    if (activeFilters.album && music.albumName !== activeFilters.album) {
      return false;
    }
    if (activeFilters.tag && !music.hasTag(activeFilters.tag)) {
      return false;
    }
    if (activeFilters.search) {
      const term = activeFilters.search;
      return [music.titulo, music.artista, music.albumName]
        .some(field => String(field).toLowerCase().includes(term));
    }
    return true;
  });
}

function renderFilterChips() {
  if (!filterChipList) return;

  filterChipList.innerHTML = '';
  Object.entries(activeFilters).forEach(([key, value]) => {
    if (!value) return;

    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `${key === 'search' ? 'Buscar' : key.charAt(0).toUpperCase() + key.slice(1)}: ${value} <button type="button" data-key="${key}">&times;</button>`;
    filterChipList.appendChild(chip);
  });

  Array.from(filterChipList.querySelectorAll('button')).forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.key;
      if (!key) return;
      if (key === 'search') {
        searchInput.value = '';
      } else if (key === 'album') {
        filterAlbum.value = '';
      } else if (key === 'tag') {
        filterTag.value = '';
      }
      applyFilters();
    });
  });
}

function applyFilters() {
  activeFilters.album = filterAlbum?.value || '';
  activeFilters.tag = filterTag?.value || '';
  activeFilters.search = searchInput?.value.trim().toLowerCase() || '';
  renderLibraryTable();
  renderFilterChips();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered', reg.scope))
      .catch(err => console.warn('Service Worker registration failed', err));
  });
}

window.addEventListener('online', () => {
  document.body.classList.remove('offline');
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = 'Online: biblioteca disponível para atualizações.';
    statusElement.classList.remove('offline');
  }
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = 'Offline: músicas baixadas e caches carregados.';
    statusElement.classList.add('offline');
  }
});

window.addEventListener('load', () => {
  setupNavigation();
  loadAlbumsAndTags();
  if (uploadForm) {
    uploadForm.addEventListener('submit', uploadMusic);
  }
  if (audioFileInput) {
    audioFileInput.addEventListener('change', () => {
      const file = audioFileInput.files?.[0];
      if (file) {
        parseAudioMetadata(file);
      }
    });
  }
  if (filterAlbum) {
    filterAlbum.addEventListener('change', applyFilters);
  }
  if (filterTag) {
    filterTag.addEventListener('change', applyFilters);
  }
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
});
