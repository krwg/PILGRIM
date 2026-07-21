import type { ParsedChapter, RenderOptions, ChapterManifestEntry } from '../types.js';
import { type ChapterAccessPolicy } from '../manifest/access.js';
import type { ReaderStrings } from '../i18n/strings.js';
export interface FootnoteRendererContext {
    container: ParentNode;
    glossary: Record<string, string>;
}
export interface DocumentExhibitContext {
    inner: string;
    glossary: Record<string, string>;
    options: RenderOptions;
}
export interface TableOfContentsContext {
    chapters: ChapterManifestEntry[];
    progress: Record<string, {
        pct: number;
    }>;
    onNavigate: (chapterId: string) => void;
    chapterAccess?: ChapterAccessPolicy;
    strings?: Partial<ReaderStrings>;
}
export interface ChapterTransitionContext {
    root: HTMLElement;
    html: string;
}
export interface ChapterNavContext {
    chapters: ChapterManifestEntry[];
    chapterId: string;
    chapterAccess?: ChapterAccessPolicy;
    strings?: Partial<ReaderStrings>;
}
export interface PalimpsestSlots {
    FootnoteRenderer: (ctx: FootnoteRendererContext) => () => void;
    DocumentExhibit: (ctx: DocumentExhibitContext) => string;
    TableOfContents: (ctx: TableOfContentsContext) => string;
    ChapterTransition: (ctx: ChapterTransitionContext) => void | Promise<void>;
}
export declare function defaultFootnoteRenderer(ctx: FootnoteRendererContext): () => void;
export declare function defaultDocumentExhibit(ctx: DocumentExhibitContext): string;
export declare function defaultTableOfContents(ctx: TableOfContentsContext): string;
export declare function defaultChapterTransition(ctx: ChapterTransitionContext): void;
export declare function defaultChapterNavHtml(ctx: ChapterNavContext): string;
export declare function defaultLockedChapterHtml(entry: ChapterManifestEntry, strings?: ReaderStrings): string;
export declare function defaultRenderChapterHtml(parsed: ParsedChapter, options?: RenderOptions, extras?: {
    entry?: ChapterManifestEntry;
    chapterNavHtml?: string;
}): string;
export declare const defaultSlots: PalimpsestSlots;
//# sourceMappingURL=defaults.d.ts.map