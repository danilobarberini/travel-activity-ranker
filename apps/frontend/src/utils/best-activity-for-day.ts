import type { ActivityType } from '../graphql/generated/graphql';

export interface ActivityScoreEntry {
  activity: ActivityType;
  score: number | null;
  reasoning: string[];
}

/**
 * Highest-scoring activity for a single day, ignoring entries with no data
 * (e.g. surf inland). Returns null only if every activity is null, which
 * shouldn't happen in practice (skiing/outdoor/indoor never return null) but
 * is handled rather than assumed away.
 */
export function getBestActivityForDay(
  activities: ActivityScoreEntry[],
): ActivityScoreEntry | null {
  let best: ActivityScoreEntry | null = null;

  for (const activity of activities) {
    if (activity.score === null) continue;
    if (!best || activity.score > (best.score as number)) {
      best = activity;
    }
  }

  return best;
}
