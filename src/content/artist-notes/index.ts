// 가수별 편집부 해설 — 정적 데이터. 해설이 있는 가수 프로필만 색인(index) 대상.
import type { ArtistNote } from '../types';
import { notesE } from './part-e';
import { notesF } from './part-f';
import { notesG } from './part-g';

export const ARTIST_NOTES: Record<string, ArtistNote> = { ...notesE, ...notesF, ...notesG };

export function getArtistNote(slug: string): ArtistNote | undefined {
  return ARTIST_NOTES[slug];
}

export const INDEXED_ARTIST_SLUGS = new Set(Object.keys(ARTIST_NOTES));
