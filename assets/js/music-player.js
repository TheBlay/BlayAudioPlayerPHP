class MusicPlayerUI {
  constructor() {
    this.audio = document.getElementById('audio-player');
    this.playlistList = document.getElementById('player-playlist');
    this.titleEl = document.getElementById('titulo');
    this.artistEl = document.getElementById('artista');
    this.coverEl = document.getElementById('capa');
    this.statusEl = document.getElementById('status');
  }

  renderPlaylist(musicas, activeIndex = 0) {
    if (!this.playlistList) return;
    this.playlistList.innerHTML = '';

    if (!Array.isArray(musicas) || musicas.length === 0) {
      const item = document.createElement('li');
      item.textContent = 'Nenhuma música disponível.';
      this.playlistList.appendChild(item);
      return;
    }

    musicas.forEach((musica, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'playlist-item';
      button.textContent = `${musica.titulo || 'Sem título'} — ${musica.artista || 'Desconhecido'}`;
      if (index === activeIndex) {
        button.classList.add('active');
      }
      button.addEventListener('click', () => {
        if (typeof window.playMusicAtIndex === 'function') {
          window.playMusicAtIndex(index);
        }
      });
      item.appendChild(button);
      this.playlistList.appendChild(item);
    });
  }

  setCurrentTrack(musica) {
    if (!musica) return;
    if (this.titleEl) this.titleEl.textContent = musica.titulo || 'Sem título';
    if (this.artistEl) this.artistEl.textContent = musica.artista || 'Desconhecido';
    if (this.coverEl) this.coverEl.src = musica.coverSrc || 'assets/icons/capa-default.svg';
    if (this.audio) this.audio.src = musica.caminho_arquivo || '';
    if (this.statusEl) this.statusEl.textContent = `Tocando: ${musica.titulo || 'Sem título'}`;
  }
}

window.MusicPlayerUI = MusicPlayerUI;
