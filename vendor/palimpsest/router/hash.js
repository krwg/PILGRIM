export function parseHash(hash = typeof location !== 'undefined' ? location.hash : '') {
    const h = hash.replace(/^#/, '');
    const m = h.match(/^\/?chapter\/([^/?#]+)/);
    if (m)
        return { kind: 'chapter', chapterId: decodeURIComponent(m[1]) };
    return { kind: 'home' };
}
export function chapterHash(chapterId) {
    return `#/chapter/${encodeURIComponent(chapterId)}`;
}
export function startHashRouter(onRoute) {
    const fire = () => onRoute(parseHash(location.hash));
    window.addEventListener('hashchange', fire);
    fire();
    return () => window.removeEventListener('hashchange', fire);
}
//# sourceMappingURL=hash.js.map