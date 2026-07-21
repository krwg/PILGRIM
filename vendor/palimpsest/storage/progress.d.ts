import type { ReaderStorageKeys } from '../types.js';
export declare const DEFAULT_STORAGE_KEYS: ReaderStorageKeys;
export interface ReaderSettings {
    size: number;
    theme: string;
    spacing: 'compact' | 'normal' | 'spacious';
    narrow: boolean;
    chromeHidden: boolean;
}
export declare function loadSettings(keys?: ReaderStorageKeys): ReaderSettings;
export declare function saveSettings(settings: ReaderSettings, keys?: ReaderStorageKeys): void;
export interface ChapterProgress {
    scrollY: number;
    pct: number;
    ts: number;
}
export declare function loadAllProgress(keys?: ReaderStorageKeys): Record<string, ChapterProgress>;
export declare function saveChapterProgress(chId: string, scrollY: number, pct: number, keys?: ReaderStorageKeys): void;
//# sourceMappingURL=progress.d.ts.map