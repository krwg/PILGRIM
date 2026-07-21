import type { ChapterManifest, CreateReaderOptions } from './types.js';
export interface PalimpsestReader {
    destroy: () => void;
    navigate: (chapterId: string | null) => void;
    getManifest: () => ChapterManifest | null;
    setTheme: (name: string) => void;
}
export declare function createReader(options: CreateReaderOptions): Promise<PalimpsestReader>;
//# sourceMappingURL=createReader.d.ts.map