const API_URL = '/api/db';
const DB_KEY = 'entreAmigos_db';

let apiMode = null;
const listeners = {};

// ── detect API availability ──
const initPromise = (async () => {
  try {
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setup' }),
    });
    apiMode = r.ok;
  } catch {
    apiMode = false;
  }
})();

async function api(action, params = {}) {
  const r = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.error || 'API error');
  }
  return r.json();
}

// ── localStorage helpers ──
function getStore() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || {}; } catch { return {}; }
}
function saveStore(s) { localStorage.setItem(DB_KEY, JSON.stringify(s)); }

function getAt(store, path) {
  let cur = store;
  for (const p of path.split('/')) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}
function setAt(store, path, data) {
  const parts = path.split('/');
  let cur = store;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = data;
}
function delAt(store, path) {
  const parts = path.split('/');
  let cur = store;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) return;
    cur = cur[parts[i]];
  }
  delete cur[parts[parts.length - 1]];
}

// ── snapshot factories ──
function docSnap(id, data) {
  return {
    exists: () => data != null && typeof data === 'object',
    data: () => data ? { ...data } : undefined,
    id,
  };
}
function collSnap(docs) {
  const mapped = docs.map(d => ({
    id: d.id,
    data: () => ({ ...d.data }),
    exists: () => true,
  }));
  return {
    docs: mapped,
    empty: mapped.length === 0,
    size: mapped.length,
    forEach: fn => mapped.forEach(fn),
  };
}

// ── listener notification ──
async function notifyAll(changedPath) {
  for (const [lp, info] of Object.entries(listeners)) {
    if (changedPath.startsWith(lp) || lp.startsWith(changedPath)) {
      await refresh(lp, info);
    }
  }
}

async function refresh(path, info) {
  try {
    if (apiMode) {
      if (info.type === 'doc') {
        const r = await api('getDoc', { path });
        info.cbs.forEach(cb => cb(docSnap(r.id, r.exists ? r.data : undefined)));
      } else {
        const r = await api('getDocs', { path });
        info.cbs.forEach(cb => cb(collSnap(r.docs)));
      }
    } else {
      const store = getStore();
      if (info.type === 'doc') {
        info.cbs.forEach(cb => cb(docSnap(path.split('/').pop(), getAt(store, path))));
      } else {
        const coll = getAt(store, path) || {};
        const docs = Object.entries(coll)
          .filter(([, v]) => v && typeof v === 'object' && !Array.isArray(v))
          .map(([id, data]) => ({ id, data }));
        info.cbs.forEach(cb => cb(collSnap(docs)));
      }
    }
  } catch (e) {
    console.warn('refresh error:', e);
  }
}

// ── public API ──
export const db = 'auto';

export function doc(_db, ...p) { return { type: 'doc', path: p.join('/') }; }
export function collection(_db, ...p) { return { type: 'collection', path: p.join('/') }; }

export async function getDoc(ref) {
  await initPromise;
  if (apiMode) {
    const r = await api('getDoc', { path: ref.path });
    return docSnap(r.id, r.exists ? r.data : undefined);
  }
  const store = getStore();
  return docSnap(ref.path.split('/').pop(), getAt(store, ref.path));
}

export async function setDoc(ref, data, options = {}) {
  await initPromise;
  const clean = JSON.parse(JSON.stringify(data));
  if (apiMode) {
    await api('setDoc', { path: ref.path, data: clean, options });
  } else {
    const store = getStore();
    if (options.merge) {
      const existing = getAt(store, ref.path) || {};
      setAt(store, ref.path, { ...existing, ...clean });
    } else {
      setAt(store, ref.path, clean);
    }
    saveStore(store);
  }
  await notifyAll(ref.path);
}

export async function addDoc(collRef, data) {
  await initPromise;
  const clean = JSON.parse(JSON.stringify(data));
  if (apiMode) {
    const r = await api('addDoc', { path: collRef.path, data: clean });
    await notifyAll(collRef.path);
    return { id: r.id, path: r.path };
  }
  const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const store = getStore();
  setAt(store, collRef.path + '/' + id, clean);
  saveStore(store);
  await notifyAll(collRef.path);
  return { id, path: collRef.path + '/' + id };
}

export async function deleteDoc(ref) {
  await initPromise;
  if (apiMode) {
    await api('deleteDoc', { path: ref.path });
  } else {
    const store = getStore();
    delAt(store, ref.path);
    saveStore(store);
  }
  await notifyAll(ref.path);
}

export async function updateDoc(ref, data) {
  await initPromise;
  const clean = JSON.parse(JSON.stringify(data));
  if (apiMode) {
    await api('updateDoc', { path: ref.path, data: clean });
  } else {
    const store = getStore();
    const existing = getAt(store, ref.path) || {};
    setAt(store, ref.path, { ...existing, ...clean });
    saveStore(store);
  }
  await notifyAll(ref.path);
}

export function onSnapshot(ref, callback) {
  const key = ref.path;
  if (!listeners[key]) {
    listeners[key] = { type: ref.type, cbs: new Set(), iv: null };
  }
  listeners[key].cbs.add(callback);

  initPromise.then(() => refresh(key, listeners[key]));

  if (!listeners[key].iv) {
    listeners[key].iv = setInterval(() => refresh(key, listeners[key]), 10000);
  }

  return () => {
    listeners[key]?.cbs.delete(callback);
    if (listeners[key]?.cbs.size === 0) {
      clearInterval(listeners[key].iv);
      delete listeners[key];
    }
  };
}

export function query(collRef, ...constraints) {
  return { ...collRef, constraints };
}

export function where(field, op, value) {
  return { type: 'where', field, op, value };
}

export async function getDocs(queryRef) {
  await initPromise;
  if (apiMode) {
    const r = await api('getDocs', { path: queryRef.path, constraints: queryRef.constraints });
    return collSnap(r.docs);
  }
  const store = getStore();
  const coll = getAt(store, queryRef.path) || {};
  let docs = Object.entries(coll)
    .filter(([, v]) => v && typeof v === 'object' && !Array.isArray(v))
    .map(([id, data]) => ({ id, data }));

  if (queryRef.constraints?.length) {
    docs = docs.filter(d =>
      queryRef.constraints.every(c => {
        if (c.type !== 'where') return true;
        const val = d.data[c.field];
        if (c.op === '==') return val === c.value;
        if (c.op === '!=') return val !== c.value;
        if (c.op === '>') return val > c.value;
        if (c.op === '<') return val < c.value;
        return true;
      })
    );
  }
  return collSnap(docs);
}

export function serverTimestamp() {
  return new Date().toISOString();
}
