/** Replace any previous engine prefetch link with `href` (or clear). */
export function setPrefetch(href) {
    document.querySelectorAll('link[data-ps-prefetch]').forEach((l) => l.remove());
    if (!href)
        return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.dataset.psPrefetch = '1';
    document.head.appendChild(link);
}
//# sourceMappingURL=prefetch.js.map