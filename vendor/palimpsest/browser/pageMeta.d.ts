export interface PageMetaInput {
    title: string;
    description?: string;
    image?: string;
    path?: string;
    /** theme-color meta; when omitted, existing value is left alone */
    themeColor?: string;
}
/** Update document title + common OG / Twitter / description / theme-color tags. */
export declare function setPageMeta(input: PageMetaInput): void;
//# sourceMappingURL=pageMeta.d.ts.map