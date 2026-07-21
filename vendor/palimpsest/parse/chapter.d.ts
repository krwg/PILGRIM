import type { ChapterMeta, ParsedChapter } from '../types.js';
export declare function parseMetaBlock(fmBlock: string): ChapterMeta;
export declare function extractGlossary(bodyRaw: string): {
    glossary: Record<string, string>;
    body: string;
};
export declare function parseChapter(raw: string, fallback?: ChapterMeta): ParsedChapter;
//# sourceMappingURL=chapter.d.ts.map