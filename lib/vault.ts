/**
 * Coffre local : le dossier est chiffré en AES-GCM avant d'être écrit dans localStorage.
 * La clé est non extractible et vit dans IndexedDB. Rien n'est conservé côté serveur.
 */
const DB = "plaidoyer-vault";
const STORE = "keys";
const DATA_KEY = "plaidoyer.dossier.v1";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idb<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getKey(create: boolean): Promise<CryptoKey | null> {
  const existing = await idb<CryptoKey | undefined>("readonly", (s) => s.get("main"));
  if (existing) return existing;
  if (!create) return null;
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  await idb("readwrite", (s) => s.put(key, "main"));
  return key;
}

const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...Array.from(new Uint8Array(buf as ArrayBuffer))));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function saveVault(data: unknown): Promise<void> {
  const key = await getKey(true);
  if (!key) return;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(data));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain);
  localStorage.setItem(DATA_KEY, JSON.stringify({ iv: b64(iv), d: b64(cipher) }));
}

export async function loadVault<T>(): Promise<T | null> {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return null;
    const key = await getKey(false);
    if (!key) return null;
    const { iv, d } = JSON.parse(raw);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(d));
    return JSON.parse(new TextDecoder().decode(plain)) as T;
  } catch {
    return null;
  }
}

export async function wipeVault(): Promise<void> {
  try {
    localStorage.removeItem(DATA_KEY);
    const db = await openDb();
    db.close();
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(DB);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
  } catch {
    /* rien à effacer */
  }
}
