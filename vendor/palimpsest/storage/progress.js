export const DEFAULT_STORAGE_KEYS = {
    settings: 'palimpsest-reader',
    progress: 'palimpsest-progress',
};
export function loadSettings(keys = DEFAULT_STORAGE_KEYS) {
    try {
        const s = JSON.parse(localStorage.getItem(keys.settings) || '{}');
        return {
            size: typeof s.size === 'number' ? s.size : 1,
            theme: s.theme || 'dossier',
            spacing: s.spacing || 'normal',
            narrow: !!s.narrow,
            chromeHidden: !!s.chromeHidden,
        };
    }
    catch {
        return {
            size: 1,
            theme: 'dossier',
            spacing: 'normal',
            narrow: false,
            chromeHidden: false,
        };
    }
}
export function saveSettings(settings, keys = DEFAULT_STORAGE_KEYS) {
    const { size, theme, spacing, narrow, chromeHidden } = settings;
    localStorage.setItem(keys.settings, JSON.stringify({ size, theme, spacing, narrow, chromeHidden }));
}
export function loadAllProgress(keys = DEFAULT_STORAGE_KEYS) {
    try {
        return JSON.parse(localStorage.getItem(keys.progress) || '{}');
    }
    catch {
        return {};
    }
}
export function saveChapterProgress(chId, scrollY, pct, keys = DEFAULT_STORAGE_KEYS) {
    const all = loadAllProgress(keys);
    all[chId] = { scrollY, pct, ts: Date.now() };
    localStorage.setItem(keys.progress, JSON.stringify(all));
}
//# sourceMappingURL=progress.js.map