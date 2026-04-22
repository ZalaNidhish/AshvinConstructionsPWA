import { openDB } from 'idb';

const DB_NAME = 'ashvin-construction';
const DB_VERSION = 1;

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          const ps = db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
          ps.createIndex('status', 'status');
        }
        ['materials', 'labour', 'payments', 'misc'].forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            const s = db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
            s.createIndex('project_id', 'project_id');
          }
        });
      },
    });
  }
  return dbPromise;
}

export async function getAllProjects() {
  const db = await getDB();
  return db.getAll('projects');
}

export async function getProject(id) {
  const db = await getDB();
  return db.get('projects', id);
}

export async function saveProject(data) {
  const db = await getDB();
  if (data.id) return db.put('projects', data);
  return db.add('projects', { ...data, created_at: new Date().toISOString() });
}

export async function getByProject(store, projectId) {
  const db = await getDB();
  return db.getAllFromIndex(store, 'project_id', projectId);
}

export async function addEntry(store, data) {
  const db = await getDB();
  return db.add(store, data);
}

export async function deleteEntry(store, id) {
  const db = await getDB();
  return db.delete(store, id);
}
