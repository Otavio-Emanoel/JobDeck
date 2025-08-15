import type { Resume } from '../../types/resume';

type SavedItem = { id: string; resume: Resume; createdAt: number };
const memory: SavedItem[] = [];

export async function saveResume(resume: Resume) {
  const item: SavedItem = { id: Date.now().toString(), resume, createdAt: Date.now() };
  memory.unshift(item);
  return item;
}

export async function loadResumes() {
  return memory;
}

export async function getResume(id: string) {
  return memory.find(i => i.id === id);
}

export async function updateResume(id: string, resume: Resume) {
  const idx = memory.findIndex(i => i.id === id);
  if (idx === -1) return null as unknown;
  memory[idx].resume = resume;
  return memory[idx];
}
