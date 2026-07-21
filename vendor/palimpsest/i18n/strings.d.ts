export interface ReaderStrings {
    toolbarLabel: string;
    fontMinus: string;
    fontPlus: string;
    cycleTheme: string;
    moreSettings: string;
    spacingLabel: string;
    narrowColumn: string;
    hideChrome: string;
    continueMessage: string;
    continueYes: string;
    continueNo: string;
    prevChapter: string;
    nextChapter: string;
    closeLightbox: string;
    expandFigure: string;
    translate: string;
    original: string;
    /** TOC / locked chapter eyebrow */
    chaptersLabel: string;
    soonLabel: string;
    lockedEyebrow: string;
    lockedMessage: string;
    backToChapters: string;
    homeLink: string;
    /** Progress label when pct ≥ 0.97 */
    progressDone: string;
    /** Progress mid-read; `{pct}` → integer 0–100 */
    progressPct: string;
    continueCta: string;
}
export declare const defaultReaderStrings: ReaderStrings;
export declare function resolveReaderStrings(partial?: Partial<ReaderStrings>): ReaderStrings;
export interface ReaderNavigationOptions {
    gestures?: boolean;
    continuePrompt?: boolean;
}
export interface ReaderFeatureOptions {
    chrome?: boolean;
    lightbox?: boolean;
    progressBar?: boolean;
    navigation?: ReaderNavigationOptions;
}
export declare function resolveReaderFeatures(features?: ReaderFeatureOptions): Required<ReaderFeatureOptions> & {
    navigation: Required<ReaderNavigationOptions>;
};
//# sourceMappingURL=strings.d.ts.map