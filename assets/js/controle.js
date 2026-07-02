let musicas = [];
let indiceAtual = 0;
const audio = document.getElementById('audio-player');
const statusElement = document.getElementById('status');
const libraryBody = document.getElementById('library-table-body');
const libraryStatus = document.getElementById('library-status');
const playerPlaylist = document.getElementById('player-playlist');
let playerUI = null;

function updateStatus(text, offline = false) {
  if (!statusElement) return;
  statusElement.textContent = text;
  statusElement.classList.toggle('offline', offline);
}

function preloadAudioTrack(url) {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    return;
  }
  navigator.serviceWorker.controller.postMessage({
    type: 'PRELOAD_AUDIO',
    url
  });
}

function saveClientState() {
  const prefs = {
    lastIndex: indiceAtual,
    volume: audio.volume,
    paused: audio.paused
  };

  storage.savePlaylist({
    musicas,
    savedAt: new Date().toISOString()
  }).catch(err => console.warn('Failed to save playlist:', err));

  storage.savePrefs(prefs).catch(err => console.warn('Failed to save prefs:', err));
}

function createMusicInstance(data) {
  if (typeof Music === 'function') {
    return new Music(data);
  }
  return data;
}

function loadClientState() {
  return Promise.all([
    storage.loadPlaylist(),
    storage.loadPrefs()
  ]).then(([savedPlaylist, prefs]) => {
    if (savedPlaylist && Array.isArray(savedPlaylist.musicas) && savedPlaylist.musicas.length > 0) {
      musicas = savedPlaylist.musicas.map(createMusicInstance);
      updateStatus('Offline playlist carregada.', true);
      renderLibraryTable();
    }

    if (prefs) {
      if (typeof prefs.lastIndex === 'number') {
        indiceAtual = prefs.lastIndex;
      }
      if (typeof prefs.volume === 'number') {
        audio.volume = prefs.volume;
      }
    }

    return { savedPlaylist, prefs };
  }).catch(err => {
    console.warn('Failed to load client state:', err);
    updateStatus('Falha ao carregar preferências.', true);
    return {};
  });
}

function fetchAndSyncPlaylist() {
  if (libraryStatus) {
    libraryStatus.textContent = 'Sincronizando biblioteca...';
  }

  return storage.loadPlaylist()
    .then(savedPlaylist => {
      const playlistTracks = Array.isArray(savedPlaylist?.musicas) ? savedPlaylist.musicas : [];
      musicas = playlistTracks.map(createMusicInstance);
      renderLibraryTable();
      renderPlayerPlaylist();

      if (musicas.length > 0) {
        indiceAtual = Math.min(indiceAtual, musicas.length - 1);
        carregarMusica(indiceAtual);
      } else {
        updateStatus('Nenhuma música disponível.', true);
      }

      if (libraryStatus) {
        libraryStatus.textContent = musicas.length > 0
          ? `Total de músicas: ${musicas.length}`
          : 'Biblioteca local vazia';
      }
    })
    .catch(err => {
      console.warn('Failed to load local playlist:', err);
      updateStatus('Offline: usando playlist em cache.', true);
      if (libraryStatus) {
        libraryStatus.textContent = `Biblioteca offline (${musicas.length} músicas)`;
      }
    });
}

function renderPlayerPlaylist() {
  if (!playerPlaylist) return;
  if (!playerUI) {
    playerUI = new window.MusicPlayerUI();
  }
  playerUI.renderPlaylist(musicas, indiceAtual);
}

function carregarMusica(indice) {
  if (!Array.isArray(musicas) || musicas.length === 0) {
    updateStatus('Nenhuma música disponível.', true);
    return;
  }

  const safeIndex = ((indice % musicas.length) + musicas.length) % musicas.length;
  const musica = musicas[safeIndex];
  if (!musica) {
    updateStatus('Nenhuma música disponível.', true);
    return;
  }

  indiceAtual = safeIndex;
  if (!playerUI) {
    playerUI = new window.MusicPlayerUI();
  }
  playerUI.setCurrentTrack(musica);
  if (audio) {
    audio.src = musica.caminho_arquivo || '';
    audio.load();
  }
  renderPlayerPlaylist();
  renderLibraryTable();
  preloadNextTrack();
  saveClientState();
}

function preloadNextTrack() {
  if (musicas.length === 0) {
    return;
  }
  const nextIndex = (indiceAtual + 1) % musicas.length;
  const nextMusic = musicas[nextIndex];
  if (nextMusic && nextMusic.caminho_arquivo) {
    preloadAudioTrack(nextMusic.caminho_arquivo);
  }
}

function renderLibraryTable() {
  if (!libraryBody) return;

  const filteredList = typeof filterMusicList === 'function' ? filterMusicList(musicas) : musicas;

  if (!Array.isArray(musicas)) {
    musicas = [];
  }

  if (filteredList.length === 0) {
    libraryBody.innerHTML = '<tr><td colspan="5">Nenhuma música disponível.</td></tr>';
    return;
  }

  libraryBody.innerHTML = '';
  filteredList.forEach((musica, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><button class="link-button" data-index="${index}">${musica.titulo}</button></td>
      <td>${musica.artista}</td>
      <td>${musica.albumName}</td>
      <td>${musica.formattedTags}</td>
      <td><button class="remove-button" data-id="${musica.id}">Remover</button></td>
    `;
    libraryBody.appendChild(row);
  });

  Array.from(libraryBody.querySelectorAll('.link-button')).forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index);
      if (!Number.isNaN(index)) {
        indiceAtual = index;
        carregarMusica(indiceAtual);
        switchView('player-view');
      }
    });
  });

  Array.from(libraryBody.querySelectorAll('.remove-button')).forEach(button => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id);
      if (!Number.isNaN(id)) {
        removeMusicById(id);
      }
    });
  });
}

function removeMusicById(id) {
  musicas = musicas.filter(music => music.id !== id);
  renderLibraryTable();
  storage.savePlaylist({ musicas, savedAt: new Date().toISOString() })
    .catch(err => console.warn('Failed to save playlist:', err));

  if (indiceAtual >= musicas.length) {
    indiceAtual = 0;
  }
  if (musicas.length > 0) {
    carregarMusica(indiceAtual);
  } else {
    audio.removeAttribute('src');
    audio.load();
    updateStatus('Nenhuma música disponível.', true);
  }
}

function initControls() {
  document.getElementById('btn-play-pause').addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  document.getElementById('btn-anterior').addEventListener('click', () => {
    if (musicas.length === 0) return;
    indiceAtual = (indiceAtual - 1 + musicas.length) % musicas.length;
    carregarMusica(indiceAtual);
    audio.play();
  });

  document.getElementById('btn-proxima').addEventListener('click', () => {
    if (musicas.length === 0) return;
    indiceAtual = (indiceAtual + 1) % musicas.length;
    carregarMusica(indiceAtual);
    audio.play();
  });

  audio.addEventListener('ended', () => {
    if (musicas.length === 0) {
      return;
    }
    indiceAtual = (indiceAtual + 1) % musicas.length;
    carregarMusica(indiceAtual);
    audio.play();
  });

  audio.addEventListener('volumechange', () => {
    storage.savePref('volume', audio.volume).catch(err => console.warn('Failed to save volume:', err));
  });
}

window.addEventListener('load', async () => {
  initControls();
  if (!window.MusicPlayerUI) {
    console.warn('Music player UI not available');
  }

  try {
    const savedPlaylist = await storage.loadPlaylist();
    const playlistTracks = Array.isArray(savedPlaylist?.musicas) ? savedPlaylist.musicas : [];
    musicas = playlistTracks.map(createMusicInstance);
    renderLibraryTable();
    renderPlayerPlaylist();

    if (musicas.length > 0) {
      carregarMusica(0);
    } else {
      updateStatus('Nenhuma música disponível.', true);
    }

    if (libraryStatus) {
      libraryStatus.textContent = musicas.length > 0
        ? `Total de músicas: ${musicas.length}`
        : 'Biblioteca local vazia';
    }
  } catch (error) {
    console.warn('Falha ao carregar biblioteca:', error);
    updateStatus('Falha ao carregar biblioteca local.', true);
  }
});

function refreshLibrary() {
  if (typeof fetchAndSyncPlaylist === 'function') {
    fetchAndSyncPlaylist();
  } else {
    renderLibraryTable();
  }
}

window.refreshLibrary = refreshLibrary;
window.fetchAndSyncPlaylist = fetchAndSyncPlaylist;
window.playMusicAtIndex = (index) => {
  indiceAtual = index;
  carregarMusica(indiceAtual);
  switchView('player-view');
};