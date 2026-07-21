import type { RenderOptions } from '../types.js';
export declare function parseFigureInner(inner: string): {
    src: string;
    caption: string;
    tag: string;
} | null;
export declare function safeFigureSrc(src: string, prefix?: string): string | null;
export declare function renderFigure(inner: string, options?: RenderOptions): string;
//# sourceMappingURL=figure.d.ts.map