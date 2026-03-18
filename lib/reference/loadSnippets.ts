import * as fs from 'fs';
import * as path from 'path';
import { validateSnippet, type SnippetRecord } from './schema';

export function loadSnippetsFromFile(filePath: string): SnippetRecord[] {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const arr: unknown[] = Array.isArray(raw) ? raw : [raw];
  return arr.map(validateSnippet);
}

export function loadAllSnippets(snippetsDir: string): SnippetRecord[] {
  const files = fs.readdirSync(snippetsDir).filter(f => f.endsWith('.json'));
  return files.flatMap(f => loadSnippetsFromFile(path.join(snippetsDir, f)));
}
