export function isChapterReadable(entry, policy = 'published-only') {
    const status = entry.status;
    if (policy === 'all-except-draft') {
        return status !== 'draft';
    }
    return status === 'published';
}
export function listReadableChapters(chapters, policy = 'published-only') {
    return chapters.filter((c) => isChapterReadable(c, policy));
}
export function adjacentReadableIds(chapters, chapterId, policy = 'published-only') {
    const readable = listReadableChapters(chapters, policy);
    const idx = readable.findIndex((c) => c.id === chapterId);
    const prevId = idx > 0 ? readable[idx - 1].id : null;
    const nextEntry = idx >= 0 && idx < readable.length - 1 ? readable[idx + 1] : null;
    return { prevId, nextId: nextEntry?.id ?? null, nextEntry };
}
//# sourceMappingURL=access.js.map