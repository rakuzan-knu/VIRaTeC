import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { PublicationDto } from '@viratec/contracts';
import type { Project } from '../src/entities/project/model/types';

export interface PrerenderRecords {
  publications: PublicationDto[];
  projects: Project[];
}

interface ApiPage<T> {
  data?: T;
  meta?: { nextCursor?: string | null };
}

const CACHE_FILE = 'node_modules/.cache/viratec-prerender/records.json';
const API_TIMEOUT_MS = 15_000;
const PROJECT_PAGE_LIMIT = 100;

export const EMPTY_RECORDS: PrerenderRecords = { publications: [], projects: [] };

const getPage = async <T>(url: string): Promise<ApiPage<T>> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(API_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return (await response.json()) as ApiPage<T>;
};

const fetchPublications = async (apiUrl: (path: string) => string) => {
  const { data } = await getPage<PublicationDto[]>(apiUrl('/api/v1/publications'));
  if (!Array.isArray(data)) throw new Error('unexpected response shape');
  return data;
};

const fetchProjects = async (apiUrl: (path: string) => string) => {
  const projects: Project[] = [];
  let cursor: string | null | undefined;
  do {
    const query = new URLSearchParams({ limit: String(PROJECT_PAGE_LIMIT) });
    if (cursor) query.set('cursor', cursor);
    const page = await getPage<Project[]>(apiUrl(`/api/v1/projects?${query}`));
    if (!Array.isArray(page.data)) throw new Error('unexpected response shape');
    projects.push(...page.data);
    cursor = page.meta?.nextCursor;
  } while (cursor);
  return projects;
};

const attempt = async <T>(
  label: string,
  load: () => Promise<T[]>,
  warn: (message: string) => void,
): Promise<T[]> => {
  try {
    return await load();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    warn(`${label} pages were not prerendered with data: the API is unavailable (${reason})`);
    return [];
  }
};

export const fetchRecords = async (
  apiUrl: (path: string) => string,
  warn: (message: string) => void,
): Promise<PrerenderRecords> => ({
  publications: await attempt('Publication', () => fetchPublications(apiUrl), warn),
  projects: await attempt('Project', () => fetchProjects(apiUrl), warn),
});

export const saveRecords = async (root: string, records: PrerenderRecords) => {
  const file = resolve(root, CACHE_FILE);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(records));
};

export const loadRecords = async (root: string): Promise<PrerenderRecords> => {
  const text = await readFile(resolve(root, CACHE_FILE), 'utf8').catch(() => null);
  return text === null ? EMPTY_RECORDS : (JSON.parse(text) as PrerenderRecords);
};
