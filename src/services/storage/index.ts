import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Resume } from '../../types/resume';
import type { TemplateDoc } from '../../types/template';

export type SavedItem =
  | { kind: 'resume'; id: string; resume: Resume; createdAt: number }
  | { kind: 'template'; id: string; template: TemplateDoc; createdAt: number };

const STORAGE_KEY = '@jobdeck/resumes';
let cache: SavedItem[] | null = null;

async function readAll(): Promise<SavedItem[]> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as SavedItem[]) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

async function writeAll(list: SavedItem[]) {
  cache = list;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function saveResume(resume: Resume) {
  const list = await readAll();
  const item: SavedItem = { kind: 'resume', id: Date.now().toString(), resume, createdAt: Date.now() };
  const updated = [item, ...list];
  await writeAll(updated);
  return item;
}

export async function saveTemplateDoc(doc: TemplateDoc) {
  const list = await readAll();
  const item: SavedItem = { kind: 'template', id: Date.now().toString(), template: doc, createdAt: Date.now() };
  const updated = [item, ...list];
  await writeAll(updated);
  return item;
}

export async function loadResumes() {
  return await readAll();
}

export async function getResume(id: string) {
  const list = await readAll();
  return list.find((i) => i.id === id && i.kind === 'resume');
}

export async function getTemplateDoc(id: string) {
  const list = await readAll();
  return list.find((i) => i.id === id && i.kind === 'template');
}

export async function updateResume(id: string, resume: Resume) {
  const list = await readAll();
  const idx = list.findIndex((i) => i.id === id && i.kind === 'resume');
  if (idx === -1) return null as unknown;
  const updated = [...list];
  updated[idx] = { ...(updated[idx] as any), resume };
  await writeAll(updated);
  return updated[idx];
}

export async function updateTemplateDoc(id: string, doc: TemplateDoc) {
  const list = await readAll();
  const idx = list.findIndex((i) => i.id === id && i.kind === 'template');
  if (idx === -1) return null as unknown;
  const updated = [...list];
  updated[idx] = { ...(updated[idx] as any), template: doc };
  await writeAll(updated);
  return updated[idx];
}

export async function removeItem(id: string) {
  const list = await readAll();
  const updated = list.filter((i) => i.id !== id);
  await writeAll(updated);
  return true;
}

export async function clearAllResumes() {
  await writeAll([]);
}
