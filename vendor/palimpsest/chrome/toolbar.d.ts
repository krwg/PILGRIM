import type { ReaderStrings } from '../i18n/strings.js';
import type { ReaderSettings } from '../storage/progress.js';
import type { ReaderStorageKeys } from '../types.js';
import type { PalimpsestTheme } from '../types.js';
export interface ChromeController {
    apply: () => void;
    destroy: () => void;
}
export declare function mountReaderChrome(options: {
    settings: ReaderSettings;
    storageKeys: ReaderStorageKeys;
    strings: ReaderStrings;
    themes: Record<string, PalimpsestTheme>;
    themeOrder?: string[];
    onSettingsChange?: (settings: ReaderSettings) => void;
}): ChromeController;
//# sourceMappingURL=toolbar.d.ts.map