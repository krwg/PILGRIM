import type { ReaderStrings } from '../i18n/strings.js';
export interface ProgressLike {
    pct: number;
}
/**
 * Human label for chapter progress, matching Piligrim semantics:
 * null below 3%, done at ≥97%, otherwise ~N%.
 */
export declare function formatProgressLabel(progress: ProgressLike | null | undefined, strings: Pick<ReaderStrings, 'progressDone' | 'progressPct'>): string | null;
//# sourceMappingURL=progressLabel.d.ts.map