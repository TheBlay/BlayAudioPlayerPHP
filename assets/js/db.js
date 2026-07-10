
// Funções para manipulação do banco de dados IndexedDB,
//Utilizando Dexie.js para simplificar a interação com o banco de dados.
//Em PWA, o IndexedDB é usado para armazenar arquivos de áudio localmente, permitindo que o aplicativo funcione offline.
import Dexie from 'dexie';

export const db = new Dexie('AudioPlayerDB');

// Define schema. Multi-entry index (*) allows efficient tag querying.
db.version(1).stores({
  audios: '++id, title, artist, album, *tags', 
  tags: '++id, &name', // Unique tag names
  audioTags: '++id, audioId, tagId', // Associative table for many-to-many relationship
  audioFiles: '++id, audioId' 
});
//stores() declara chaves primparias e índices para as tabelas do banco de dados.
//  A tabela 'audios' possui uma chave primária auto-incremental (id) e campos para título, artista, álbum e tags.
//  A tabela 'tags' possui uma chave primária auto-incremental (id) e um campo de nome único para as tags.
// Uma boa prática é não incluir arquivos binários nas strings de índice, pois isso pode afetar o desempenho do banco de dados.
//  Em vez disso, armazene apenas metadados e use referências para os arquivos de áudio armazenados no sistema de arquivos ou em outro local.    

