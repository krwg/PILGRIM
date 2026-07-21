export declare function cleanTooltipText(s: string): string;
export declare function parseTooltipDef(def: string): {
    term: string;
    body: string;
};
export declare function renderTooltipBody(text: string): string;
export interface FootnoteBindOptions {
    isMobile?: () => boolean;
    longBodyThreshold?: number;
}
export declare function bindFootnotes(container: ParentNode, glossary: Record<string, string>, options?: FootnoteBindOptions): () => void;
//# sourceMappingURL=tooltip.d.ts.map