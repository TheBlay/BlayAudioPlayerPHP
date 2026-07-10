// Responsável pelo funcionamento das tags associadas às músicas,
//  incluindo a criação, edição, exclusão e associação de tags com músicas.

import { db } from './db.js';

export async function createTag(name) {
  return db.tags.add({ name });
}

export async function findTagByName(name) {
  return db.tags.where('name').equals(name).first();
}