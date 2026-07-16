export interface CachedContext {
  workspaceName: string;
  totalFeedback: number;
  posCount: number;
  neuCount: number;
  negCount: number;
  themesSummary: string;
  trendsText: string;
}

interface CacheEntry {
  timestamp: number;
  context: CachedContext;
}

const cache = new Map<string, CacheEntry>();

export function getCachedContext(workspaceId: string): CachedContext | null {
  const entry = cache.get(workspaceId);
  if (entry && Date.now() - entry.timestamp < 5 * 60 * 1000) {
    return entry.context;
  }
  return null;
}

export function setCachedContext(workspaceId: string, context: CachedContext): void {
  cache.set(workspaceId, {
    timestamp: Date.now(),
    context,
  });
}

export function invalidateCachedContext(workspaceId: string): void {
  cache.delete(workspaceId);
}
