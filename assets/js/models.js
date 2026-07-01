class Music {
  constructor(data) {
    this.id = data.id;
    this.titulo = data.titulo || 'Sem título';
    this.artista = data.artista || 'Desconhecido';
    this.caminho_arquivo = data.caminho_arquivo || '';
    this.caminho_capa = data.caminho_capa || 'assets/icons/capa-default.svg';
    this.album = data.album || { nome: 'Unassigned Album' };
    this.tags = (data.tags || []).map(tag => ({ nome: String(tag.nome || tag) }));
  }

  get albumName() {
    return this.album?.nome || 'Unassigned Album';
  }

  get coverSrc() {
    return this.caminho_capa || 'assets/icons/capa-default.svg';
  }

  get formattedTags() {
    return this.tags.map(tag => tag.nome).join(' ');
  }

  hasTag(name) {
    return this.tags.some(tag => tag.nome.toLowerCase() === name.toLowerCase());
  }
}

class Album {
  constructor(nome) {
    this.nome = nome || 'Unassigned Album';
  }
}

class Tag {
  constructor(nome) {
    this.nome = nome.startsWith('#') ? nome : `#${nome}`;
  }
}
