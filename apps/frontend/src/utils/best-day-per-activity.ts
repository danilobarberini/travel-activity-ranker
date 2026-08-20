import type { ActivityType } from '../graphql/generated/graphql';

export interface BestDay {
  date: string;
  score: number;
}

interface DayActivities {
  date: string;
  activities: Array<{ activity: ActivityType; score: number | null }>;
}

/**
 * Activities with no valid score on any day (e.g. surf for a week with no wave
 * data at all) are simply absent from the result, not defaulted to a fake entry.
 */
export function getBestDayPerActivity(
  days: DayActivities[],
): Partial<Record<ActivityType, BestDay>> {
  const best: Partial<Record<ActivityType, BestDay>> = {};

  for (const day of days) {
    for (const { activity, score } of day.activities) {
      if (score === null) continue;

      const current = best[activity];
      if (!current || score > current.score) {
        best[activity] = { date: day.date, score };
      }
    }
  }

  return best;
}
