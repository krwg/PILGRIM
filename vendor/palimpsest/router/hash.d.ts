export type HashRoute = {
    kind: 'home';
} | {
    kind: 'chapter';
    chapterId: string;
};
export declare function parseHash(hash?: string): HashRoute;
export declare function chapterHash(chapterId: string): string;
export declare function startHashRouter(onRoute: (route: HashRoute) => void): () => void;
//# sourceMappingURL=hash.d.ts.map