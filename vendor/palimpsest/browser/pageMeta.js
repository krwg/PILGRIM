function absUrl(path, base = typeof location !== 'undefined' ? location.href : '') {
    try {
        return new URL(path, base).href;
    }
    catch {
        return path;
    }
}
function ensureMeta(attr, key, val) {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', val);
}
/** Update document title + common OG / Twitter / description / theme-color tags. */
export function setPageMeta(input) {
    document.title = input.title;
    if (input.description != null) {
        ensureMeta('name', 'description', input.description);
        ensureMeta('property', 'og:description', input.description);
    }
    ensureMeta('property', 'og:title', input.title);
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('name', 'twitter:card', 'summary_large_image');
    if (input.image) {
        ensureMeta('property', 'og:image', absUrl(input.image));
    }
    if (input.path != null) {
        ensureMeta('property', 'og:url', absUrl(input.path));
    }
    if (input.themeColor) {
        ensureMeta('name', 'theme-color', input.themeColor);
    }
}
//# sourceMappingURL=pageMeta.js.map