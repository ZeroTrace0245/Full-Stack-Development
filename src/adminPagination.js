export const PAGE_SIZE = 25
export function pageItems(items, page) { const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE)); const current = Math.min(page, pages - 1); return { rows: items.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE), current, pages } }
