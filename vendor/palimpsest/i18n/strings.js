export const defaultReaderStrings = {
    toolbarLabel: 'Reading settings',
    fontMinus: 'Decrease font size',
    fontPlus: 'Increase font size',
    cycleTheme: 'Cycle theme',
    moreSettings: 'More settings',
    spacingLabel: 'Line spacing',
    narrowColumn: 'Narrow column',
    hideChrome: 'Hide toolbar',
    continueMessage: 'You left off around ~{pct}%',
    continueYes: 'Continue',
    continueNo: 'Start over',
    prevChapter: 'Previous chapter',
    nextChapter: 'Next chapter',
    closeLightbox: 'Close',
    expandFigure: 'Expand illustration',
    translate: 'Translate',
    original: 'Original',
    chaptersLabel: 'Chapters',
    soonLabel: 'Soon',
    lockedEyebrow: 'Sealed',
    lockedMessage: 'This chapter will appear later.',
    backToChapters: '← Back to chapters',
    homeLink: 'Home →',
    progressDone: 'Done',
    progressPct: '~{pct}%',
    continueCta: 'Continue',
};
export function resolveReaderStrings(partial) {
    return { ...defaultReaderStrings, ...partial };
}
export function resolveReaderFeatures(features) {
    return {
        chrome: !!features?.chrome,
        lightbox: !!features?.lightbox,
        progressBar: features?.progressBar !== false,
        navigation: {
            gestures: !!features?.navigation?.gestures,
            continuePrompt: !!features?.navigation?.continuePrompt,
        },
    };
}
//# sourceMappingURL=strings.js.map