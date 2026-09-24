/**
 * After a new deploy, a tab opened on the previous version still asks for the old
 * lazy chunks (their file names change with every build), and GitHub Pages returns 404.
 * When that happens, reload once so the browser fetches the new index and chunks.
 */
const RELOAD_KEY = 'skyward.chunkReload';
const STALE_CHUNK = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

export function reloadOnStaleChunk(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (!STALE_CHUNK.test(message) || typeof location === 'undefined') return;
  try {
    // Guard against a reload loop if the chunk is really missing.
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* storage blocked: reload anyway */
  }
  location.reload();
}
