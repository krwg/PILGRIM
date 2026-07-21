import type { ChapterManifestEntry } from '../types.js';
/**
 * How createReader decides which chapters are navigable.
 * - `published-only` — Piligrim semantics: only `status === 'published'` (missing status = locked)
 * - `all-except-draft` — legacy engine default: anything except `draft`
 */
export type ChapterAccessPolicy = 'published-only' | 'all-except-draft';
export declare function isChapterReadable(entry: ChapterManifestEntry, policy?: ChapterAccessPolicy): boolean;
export declare function listReadableChapters(chapters: ChapterManifestEntry[], policy?: ChapterAccessPolicy): ChapterManifestEntry[];
export declare function adjacentReadableIds(chapters: ChapterManifestEntry[], chapterId: string, policy?: ChapterAccessPolicy): {
    prevId: string | null;
    nextId: string | null;
    nextEntry: ChapterManifestEntry | null;
};
//# sourceMappingURL=access.d.ts.map