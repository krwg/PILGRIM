import type { ReaderStrings } from '../i18n/strings.js';
import type { ChapterProgress } from '../storage/progress.js';
import type { ReaderStorageKeys } from '../types.js';
export declare function showContinuePrompt(options: {
    chapterId: string;
    saved: ChapterProgress | null | undefined;
    strings: Pick<ReaderStrings, 'continueMessage' | 'continueYes' | 'continueNo'>;
    storageKeys: ReaderStorageKeys;
    onProgress?: (pct: number) => void;
}): void;
export declare function bindChapterGestures(options: {
    prevId: string | null;
    nextId: string | null;
    strings: Pick<ReaderStrings, 'prevChapter' | 'nextChapter'>;
    go: (chapterId: string) => void;
}): () => void;
//# sourceMappingURL=continue.d.ts.map