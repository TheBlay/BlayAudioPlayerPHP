const STORAGE_DB_NAME = 'blay-audio-player-db';
const STORAGE_DB_VERSION = 1;
const STORAGE_STORE_NAME = 'keyval';

function openStorageDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORAGE_DB_NAME, STORAGE_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORAGE_STORE_NAME)) {
        db.createObjectStore(STORAGE_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getStorageItem(key) {
  return openStorageDb().then(db => new Promise((resolve, reject) => {
    const transaction = db.transaction(STORAGE_STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORAGE_STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
}

function setStorageItem(key, value) {
  return openStorageDb().then(db => new Promise((resolve, reject) => {
    const transaction = db.transaction(STORAGE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORAGE_STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => resolve(value);
    request.onerror = () => reject(request.error);
  }));
}

function removeStorageItem(key) {
  return openStorageDb().then(db => new Promise((resolve, reject) => {
    const transaction = db.transaction(STORAGE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORAGE_STORE_NAME);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  }));
}

const storage = {
  savePlaylist: musicaData => setStorageItem('playlist', musicaData),
  loadPlaylist: () => getStorageItem('playlist'),
  savePrefs: prefs => setStorageItem('prefs', prefs),
  loadPrefs: () => getStorageItem('prefs'),
  savePref: async (name, value) => {
    const prefs = (await getStorageItem('prefs')) || {};
    prefs[name] = value;
    return setStorageItem('prefs', prefs);
  },
  getPref: async (name, defaultValue) => {
    const prefs = await getStorageItem('prefs');
    if (!prefs || !(name in prefs)) {
      return defaultValue;
    }
    return prefs[name];
  },
  removePref: name => getStorageItem('prefs').then(prefs => {
    if (!prefs || !(name in prefs)) return;
    delete prefs[name];
    return setStorageItem('prefs', prefs);
  })
};

window.storage = storage;
